import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';

@Injectable()
export class PedidosService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(DetallePedido)
        private detallePedidoRepository: Repository<DetallePedido>,
    ) { }

    // Pedido CRUD
    async createPedido(createPedidoDto: Partial<Pedido>): Promise<Pedido> {
        const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const nroOrden = `ORD-${fecha}-${random}`;
        createPedidoDto.numero_orden = nroOrden;
        const pedido = this.pedidoRepository.create(createPedidoDto);
        return this.pedidoRepository.save(pedido);
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
        await this.findOnePedido(id);
        await this.pedidoRepository.update(id, updatePedidoDto);
        return this.findOnePedido(id);
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
