import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Categoria } from './entities/categoria.entity';
import { Producto } from './entities/producto.entity';
import { Combo } from './entities/combo.entity';
import { ComboProductos } from './entities/combo-productos.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria, Producto, Combo, ComboProductos]),
    CloudinaryModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule { }
