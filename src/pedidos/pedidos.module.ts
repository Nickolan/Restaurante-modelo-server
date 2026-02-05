import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { MercadoPagoService } from './mercadopago.service';
import { Producto } from '../menu/entities/producto.entity';
import { Combo } from '../menu/entities/combo.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, DetallePedido, Producto, Combo]), EmailModule],
  controllers: [PedidosController],
  providers: [PedidosService, MercadoPagoService],
})
export class PedidosModule { }
