import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { EstadoPedido, Pedido } from './entities/pedido.entity';
import { Producto } from '../menu/entities/producto.entity';
import { Combo } from '../menu/entities/combo.entity';

@Injectable()
export class MercadoPagoService {
    private client: MercadoPagoConfig;
    private preference: Preference;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,
        @InjectRepository(Combo)
        private comboRepository: Repository<Combo>,
    ) {
        const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
        console.log(accessToken);
        
        if (!accessToken) {
            throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
        }
        this.client = new MercadoPagoConfig({ accessToken });
        this.preference = new Preference(this.client);
    }

    async createPreference(pedidoId: number): Promise<{ preferenceId: string }> {
        try {
            // Retrieve the order with all necessary relations
            const pedido = await this.pedidoRepository.findOne({
                where: { id: pedidoId },
                relations: ['detalles'],
            });

            if (!pedido) {
                throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
            }

            if (!pedido.detalles || pedido.detalles.length === 0) {
                throw new BadRequestException('El pedido no tiene detalles');
            }

            // Map order items to Mercado Pago format
            const items = await Promise.all(
                pedido.detalles.map(async (detalle) => {
                    let title = 'Producto';
                    let itemId = 'item';

                    // Check if it's a product or combo
                    if (detalle.producto_id) {
                        const producto = await this.productoRepository.findOne({
                            where: { id: detalle.producto_id },
                        });
                        if (producto) {
                            title = producto.nombre;
                            itemId = `producto-${producto.id}`;
                        }
                    } else if (detalle.combo_id) {
                        const combo = await this.comboRepository.findOne({
                            where: { id: detalle.combo_id },
                        });
                        if (combo) {
                            title = combo.nombre;
                            itemId = `combo-${combo.id}`;
                        }
                    }

                    return {
                        id: itemId,
                        title,
                        unit_price: Number(detalle.precio_unitario),
                        quantity: detalle.cantidad,
                        currency_id: 'ARS', // Argentine Peso - adjust if needed
                    };
                }),
            );
            console.log(items);
            

            // Create preference with Mercado Pago
            const preferenceData = {
                items,
                back_urls: {
                    success: 'https://www.google.com/payment/success',
                    failure: 'https://www.google.com/payment/failure',
                    pending: 'https://www.google.com/payment/pending',
                },
                auto_return: 'all',
                external_reference: pedido.id.toString(),
                notification_url: 'http://localhost:3000/pedidos/webhook', // Adjust to your backend URL
                payer: {
                    name: pedido.nombre_cliente,
                    email: pedido.correo,
                    identification: {
                        type: 'DNI',
                        number: pedido.dni_cliente,
                    },
                },
            };

            console.log(preferenceData);
            

            const response = await this.preference.create({ body: preferenceData });
            console.log(response);
            

            if (!response.id) {
                throw new InternalServerErrorException('Error al crear la preferencia de pago');
            }

            return { preferenceId: response.id };
        } catch (error) {
            console.log(error);
            
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al crear preferencia de Mercado Pago: ${error.message}`,
            );
        }
    }

    async handleWebhook(paymentData: any): Promise<void> {
        try {
            // Mercado Pago sends notifications with different types
            // We're interested in 'payment' type notifications
            if (paymentData.type !== 'payment') {
                return;
            }

            // Extract payment ID from the notification
            const paymentId = paymentData.data?.id;
            if (!paymentId) {
                throw new BadRequestException('Invalid webhook data: missing payment ID');
            }

            // In a production environment, you should fetch the payment details
            // from Mercado Pago API to verify the payment status
            // For now, we'll trust the webhook data

            // Get the external_reference (pedido ID) from the payment
            const externalReference = paymentData.external_reference;
            if (!externalReference) {
                throw new BadRequestException('Invalid webhook data: missing external reference');
            }

            const pedidoId = parseInt(externalReference, 10);
            const pedido = await this.pedidoRepository.findOne({
                where: { id: pedidoId },
            });

            if (!pedido) {
                throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
            }

            // Update order status based on payment status
            // Mercado Pago payment statuses: approved, pending, rejected, etc.
            const paymentStatus = paymentData.status;

            if (paymentStatus === 'approved') {
                pedido.estado = EstadoPedido.PAGADO;
            } else if (paymentStatus === 'rejected') {
                pedido.estado = EstadoPedido.FALLADO;
            } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
                pedido.estado = EstadoPedido.PENDIENTE;
            }

            await this.pedidoRepository.save(pedido);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Error al procesar webhook de Mercado Pago: ${error.message}`,
            );
        }
    }
}
