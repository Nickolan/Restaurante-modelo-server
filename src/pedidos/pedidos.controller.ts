import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { MercadoPagoService } from './mercadopago.service';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';

@Controller('pedidos')
export class PedidosController {
    constructor(
        private readonly pedidosService: PedidosService,
        private readonly mercadoPagoService: MercadoPagoService,
    ) { }

    // Pedido endpoints
    @Post('pedido')
    createPedido(@Body() createPedidoDto: Partial<Pedido>) {
        return this.pedidosService.createPedido(createPedidoDto);
    }

    @Get('pedido')
    findAllPedidos() {
        return this.pedidosService.findAllPedidos();
    }

    @Get('pedido/:id')
    findOnePedido(@Param('id') id: string) {
        return this.pedidosService.findOnePedido(+id);
    }

    @Patch('pedido/:id')
    updatePedido(@Param('id') id: string, @Body() updatePedidoDto: Partial<Pedido>) {
        return this.pedidosService.updatePedido(+id, updatePedidoDto);
    }

    @Delete('pedido/:id')
    removePedido(@Param('id') id: string) {
        return this.pedidosService.removePedido(+id);
    }

    // Special endpoint: Query order by DNI and numero_orden
    @Get('buscar')
    findByDniAndNumero(@Query('dni') dni: string, @Query('numero') numero: string) {
        return this.pedidosService.findByDniAndNumero(dni, numero);
    }

    // DetallePedido endpoints
    @Post('detalle')
    createDetalle(@Body() createDetalleDto: Partial<DetallePedido>) {
        return this.pedidosService.createDetallePedido(createDetalleDto);
    }

    @Get('detalle')
    findAllDetalles() {
        return this.pedidosService.findAllDetalles();
    }

    @Get('detalle/:id')
    findOneDetalle(@Param('id') id: string) {
        return this.pedidosService.findOneDetalle(+id);
    }

    @Patch('detalle/:id')
    updateDetalle(@Param('id') id: string, @Body() updateDetalleDto: Partial<DetallePedido>) {
        return this.pedidosService.updateDetalle(+id, updateDetalleDto);
    }

    @Delete('detalle/:id')
    removeDetalle(@Param('id') id: string) {
        return this.pedidosService.removeDetalle(+id);
    }

    // Mercado Pago endpoints
    @Post('create-preference/:id')
    async createPreference(@Param('id') id: string) {
        return this.mercadoPagoService.createPreference(+id);
    }

    @Post('webhook')
    async handleWebhook(@Body() paymentData: any) {
        await this.mercadoPagoService.handleWebhook(paymentData);
        return { status: 'ok' };
    }
}
