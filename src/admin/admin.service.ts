import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(Reserva)
        private reservaRepository: Repository<Reserva>,
    ) { }

    async getDashboardStats(): Promise<DashboardStatsDto> {
        // Calculate all metrics in parallel for better performance
        const [
            ventasHoy,
            pedidosPendientes,
            reservasHoy,
            clientesUnicos,
            ultimosPedidos,
        ] = await Promise.all([
            this.getVentasHoy(),
            this.getPedidosPendientes(),
            this.getReservasHoy(),
            this.getClientesUnicos(),
            this.getUltimosPedidos(),
        ]);

        return {
            ventasHoy,
            pedidosPendientes,
            reservasHoy,
            clientesUnicos,
            ultimosPedidos,
        };
    }

    /**
     * Calculate total sales for today, excluding cancelled orders
     * Uses SQL SUM aggregation for performance
     */
    private async getVentasHoy(): Promise<number> {
        const result = await this.pedidoRepository
            .createQueryBuilder('pedido')
            .select('COALESCE(SUM(pedido.total), 0)', 'total')
            .where('DATE(pedido.fecha) = CURRENT_DATE')
            .andWhere('(pedido.estado) != :estado', { estado: 'cancelado' })
            .getRawOne();

        return parseFloat(result.total) || 0;
    }

    /**
     * Count orders with 'pendiente' status
     */
    private async getPedidosPendientes(): Promise<number> {
        return await this.pedidoRepository
            .createQueryBuilder('pedido')
            .where('(pedido.estado) = :estado', { estado: 'pendiente' })
            .getCount();
    }

    /**
     * Count reservations for today
     */
    private async getReservasHoy(): Promise<number> {
        return await this.reservaRepository
            .createQueryBuilder('reserva')
            .where('reserva.fecha_reserva = CURRENT_DATE')
            .getCount();
    }

    /**
     * Count unique customers by DNI
     * Uses DISTINCT to count unique dni_cliente values
     */
    private async getClientesUnicos(): Promise<number> {
        const result = await this.pedidoRepository
            .createQueryBuilder('pedido')
            .select('COUNT(DISTINCT pedido.dni_cliente)', 'count')
            .getRawOne();

        return parseInt(result.count) || 0;
    }

    /**
     * Get the latest 5 orders with their details
     * Includes relations for complete order information
     */
    private async getUltimosPedidos(): Promise<Pedido[]> {
        return await this.pedidoRepository.find({
            relations: ['detalles', 'detalles.producto', 'detalles.combo'],
            order: { id: 'DESC' },
            take: 5,
        });
    }
}
