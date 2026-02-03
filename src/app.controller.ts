import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';



@Controller()
export class AppController {
  private google_api_key: string | undefined;
  constructor(private readonly appService: AppService, private configService: ConfigService,) { 

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
}
