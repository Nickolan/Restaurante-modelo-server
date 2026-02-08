import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'; // Añade Payment aquí
import { EstadoPedido, Pedido } from './entities/pedido.entity';
import { Producto } from '../menu/entities/producto.entity';
import { Combo } from '../menu/entities/combo.entity';
import { PedidosService } from './pedidos.service';

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
        private pedidosService: PedidosService,
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
                    success: 'https://restaurante-modelo-nu.vercel.app',
                    failure: 'https://restaurante-modelo-nu.vercel.app',
                    pending: 'https://restaurante-modelo-nu.vercel.app/payment/pending',
                },
                auto_return: 'all',
                external_reference: pedido.id.toString(),
                notification_url: 'https://restaurante-modelo-server.onrender.com/pedidos/webhook', // Adjust to your backend URL
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
        console.log("HandleWebhook recibido:", paymentData);

        // 1. Extraer el ID del pago según el formato de la notificación
        // Mercado Pago puede enviar el ID en data.id o directamente en resource
        const paymentId = paymentData.data?.id || (paymentData.type === 'payment' ? paymentData.resource : null);

        // Si no es un evento de pago o no hay ID, ignoramos (evita errores con merchant_order)
        if (!paymentId || (paymentData.type && paymentData.type !== 'payment')) {
            console.log('Notificación recibida no es de tipo payment, saltando...');
            return;
        }

        console.log(`Consultando detalles para el pago: ${paymentId}`);

        // 2. BUSCAR EL PAGO REAL EN LA API DE MERCADO PAGO
        // Instanciamos el objeto Payment con nuestro cliente
        const paymentDetails = new Payment(this.client);
        const payment = await paymentDetails.get({ id: paymentId });

        // 3. Ahora sí tenemos acceso a external_reference y status real
        const externalReference = payment.external_reference;
        const paymentStatus = payment.status;

        if (!externalReference) {
            console.log('El pago no contiene external_reference');
            throw new BadRequestException('Invalid payment: missing external reference');
        }

        console.log(`Referencia externa (Pedido ID): ${externalReference}`);
        console.log(`Estado del pago: ${paymentStatus}`);

        // 4. Buscar el pedido en tu base de datos
        const pedidoId = parseInt(externalReference, 10);
        const pedido = await this.pedidoRepository.findOne({
            where: { id: pedidoId },
        });

        if (!pedido) {
            console.error(`Pedido con ID ${pedidoId} no encontrado en la DB`);
            throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
        }

        // 5. Lógica de actualización de estados
        // Evitamos procesar si el pedido ya está pagado (idempotencia)
        if (pedido.estado === EstadoPedido.PAGADO) {
            console.log('El pedido ya fue marcado como pagado anteriormente.');
            return;
        }

        if (paymentStatus === 'approved') {
            pedido.estado = EstadoPedido.PAGADO;
            
            // Intentar enviar el correo
            try {
                console.log("Enviando correo de confirmación...");
                await this.pedidosService.sendOrderConfirmationEmail(pedido.id);
            } catch (emailError) {
                console.error('Error al enviar email (el proceso continúa):', emailError.message);
            }
        } else if (paymentStatus === 'rejected') {
            pedido.estado = EstadoPedido.FALLADO;
        } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
            pedido.estado = EstadoPedido.PENDIENTE;
        }

        // 6. Guardar cambios
        await this.pedidoRepository.save(pedido);
        console.log(`Pedido ${pedidoId} actualizado a estado: ${pedido.estado}`);

    } catch (error) {
        console.error('Error en handleWebhook:', error);
        
        // Es importante no lanzar excepciones 500 siempre, 
        // porque Mercado Pago reintentará el envío infinitamente.
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error;
        }
        throw new InternalServerErrorException(`Error procesando webhook: ${error.message}`);
    }
}
}
