import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Reserva } from '../reservas/entities/reserva.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Pedido, Reserva])],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
