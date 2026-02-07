import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenuModule } from './menu/menu.module';
import { ReservasModule } from './reservas/reservas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: 'localhost',
      // port: 5432,
      // username: 'postgres',
      // password: 'nickolan',
      // database: 'restaurante_db',
      url: process.env.DATABASE_URL, // Usa la "External Database URL" de Render
      autoLoadEntities: true,
      dropSchema: false,
      synchronize: false, // ¡Ojo! Solo en desarrollo
      ssl: true, // <--- Obligatorio para Render
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      extra: {
        ssl: {
          rejectUnauthorized: false, // <--- Para que no falle por el certificado de Render
        },
      },
    }),
    CloudinaryModule,
    EmailModule,
    MenuModule,
    ReservasModule,
    PedidosModule,
    ConfiguracionModule,
    UsersModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
