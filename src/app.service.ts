import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getUbicacion({latitude, longitude, GOOGLE_API_KEY}): Promise<string | undefined> {
    try {
      
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      console.log(response.data);

      if (response.data.results.length > 0) {
        
        
        
        const direccionFormateada: string = response.data.results[0].formatted_address;
        
        return direccionFormateada;
      }
    } catch (error) {
      console.log(error.message);
      
      return error.message
    }
  }
}
