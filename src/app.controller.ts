import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email/email.service';
import { User } from './users/entities/user.entity';



@Controller()
export class AppController {
  private google_api_key: string | undefined;
  constructor(private readonly appService: AppService, private configService: ConfigService, private readonly emailService: EmailService, ) { 

    this.google_api_key = this.configService.get<string>('GOOGLE_API_KEY');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/ubicacion')
  async getUbicacion(@Body() data: {latitude: number, longitude: number}): Promise<string | undefined> {
    console.log(data.latitude, data.longitude);
    
    return this.appService.getUbicacion({latitude: data.latitude, longitude: data.longitude, GOOGLE_API_KEY: this.google_api_key})

  }

  @Get('/test-mail')
  async testEmail(): Promise<string> {
    // Creamos un usuario de prueba (puedes cambiar el email por uno tuyo)
    const mockUsuario = {
      fullName: 'Usuario de Prueba',
      email: 'nicolassantiagonavarrete.nsn@gmail.com',
    } as User;

    try {
      // Intentamos enviar el correo de bienvenida
      await this.emailService.sendWelcomeEmail(mockUsuario);
      
      return `Correo de prueba enviado con éxito a ${mockUsuario.email}. ¡Revisa tu bandeja de entrada!`;
    } catch (error) {
      console.error('Error en /test-mail:', error.message);
      return `Error al enviar el correo: ${error.message}`;
    }
  }
}
