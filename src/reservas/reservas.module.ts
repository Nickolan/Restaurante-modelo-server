import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { Reserva } from './entities/reserva.entity';
import { Mesa } from './entities/mesa.entity';
import { Zona } from './entities/zona.entity';
import { TurnoConfig } from './entities/turno-config.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Mesa, Zona, TurnoConfig]), EmailModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule { }
