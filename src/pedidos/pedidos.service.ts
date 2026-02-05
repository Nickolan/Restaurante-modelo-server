import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PedidosService {
    private readonly logger = new Logger(PedidosService.name);

    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(DetallePedido)
        private detallePedidoRepository: Repository<DetallePedido>,
        private emailService: EmailService,
        private configService: ConfigService,
    ) { }

    // Pedido CRUD
    async createPedido(createPedidoDto: Partial<Pedido>): Promise<Pedido> {
        const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const nroOrden = `ORD-${fecha}-${random}`;
        createPedidoDto.numero_orden = nroOrden;
        const pedido = this.pedidoRepository.create(createPedidoDto);
        const savedPedido = await this.pedidoRepository.save(pedido);

        // Load full pedido with relations for email
        const fullPedido = await this.findOnePedido(savedPedido.id);

        // Send order confirmation email
        try {
            await this.emailService.sendOrderConfirmation({
                customerName: fullPedido.nombre_cliente,
                customerEmail: fullPedido.correo,
                orderId: fullPedido.numero_orden,
                orderDate: new Date(fullPedido.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                }),
                items: fullPedido.detalles.map(detalle => ({
                    nombre: detalle.producto?.nombre || detalle.combo?.nombre || 'Producto',
                    cantidad: detalle.cantidad,
                    precio: detalle.precio_unitario,
                })),
                subtotal: fullPedido.total,
                total: fullPedido.total,
                estimatedTime: '30-45 minutos',
                trackingUrl: `${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/track/${fullPedido.numero_orden}`,
            });
            this.logger.log(`Order confirmation email sent for order ${fullPedido.numero_orden}`);
        } catch (error) {
            this.logger.error(`Failed to send order confirmation email: ${error.message}`);
            // Don't throw error - order was created successfully
        }

        return fullPedido;
    }

    async findAllPedidos(): Promise<Pedido[]> {
        return this.pedidoRepository.find({
            relations: ['detalles', 'detalles.producto', 'detalles.combo']
        });
    }

    async findOnePedido(id: number): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { id },
            relations: ['detalles', 'detalles.producto', 'detalles.combo'],
        });
        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
        }
        return pedido;
    }

    async updatePedido(id: number, updatePedidoDto: Partial<Pedido>): Promise<Pedido> {
        const previousPedido = await this.findOnePedido(id);
        await this.pedidoRepository.update(id, updatePedidoDto);
        const updatedPedido = await this.findOnePedido(id);

        // Send status update email if estado changed
        if (updatePedidoDto.estado && updatePedidoDto.estado !== previousPedido.estado) {
            try {
                const statusMap = {
                    'En Cocina': { status: 'En Cocina' as const, time: '20-30 minutos' },
                    'Listo': { status: 'Listo' as const, time: '10 minutos' },
                    'En Camino': { status: 'En Camino' as const, time: '15 minutos' },
                    'Entregado': { status: 'Entregado' as const, time: '' },
                };

                const statusInfo = statusMap[updatePedidoDto.estado] || { status: updatePedidoDto.estado as any, time: '' };

                await this.emailService.sendOrderStatusUpdate({
                    customerName: updatedPedido.nombre_cliente,
                    customerEmail: updatedPedido.correo,
                    orderId: updatedPedido.numero_orden,
                    currentStatus: statusInfo.status,
                    estimatedTime: statusInfo.time,
                    trackingUrl: `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/track/${updatedPedido.numero_orden}`,
                });
                this.logger.log(`Order status update email sent for order ${updatedPedido.numero_orden}`);
            } catch (error) {
                this.logger.error(`Failed to send order status update email: ${error.message}`);
            }
        }

        return updatedPedido;
    }

    async removePedido(id: number): Promise<void> {
        const result = await this.pedidoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
        }
    }

    // DetallePedido CRUD
    async createDetallePedido(createDetalleDto: Partial<DetallePedido>): Promise<DetallePedido> {
        const detalle = this.detallePedidoRepository.create(createDetalleDto);
        return this.detallePedidoRepository.save(detalle);
    }

    async findAllDetalles(): Promise<DetallePedido[]> {
        return this.detallePedidoRepository.find({ relations: ['pedido'] });
    }

    async findOneDetalle(id: number): Promise<DetallePedido> {
        const detalle = await this.detallePedidoRepository.findOne({
            where: { id },
            relations: ['pedido'],
        });
        if (!detalle) {
            throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
        }
        return detalle;
    }

    async updateDetalle(id: number, updateDetalleDto: Partial<DetallePedido>): Promise<DetallePedido> {
        await this.findOneDetalle(id);
        await this.detallePedidoRepository.update(id, updateDetalleDto);
        return this.findOneDetalle(id);
    }

    async removeDetalle(id: number): Promise<void> {
        const result = await this.detallePedidoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
        }
    }

    // Special query: Find order by DNI and numero_orden
    async findByDniAndNumero(dni_cliente: string, numero_orden: string): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { dni_cliente, numero_orden },
            relations: ['detalles', 'detalles.producto', 'detalles.combo'],
        });
        if (!pedido) {
            throw new NotFoundException('Pedido no encontrado');
        }
        return pedido;
    }
}
