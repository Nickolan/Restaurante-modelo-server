import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionService } from './configuracion.service';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionSistema])],
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService],
})
export class ConfiguracionModule { }
