import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';

@Controller('configuracion')
export class ConfiguracionController {
    constructor(private readonly configuracionService: ConfiguracionService) { }

    @Post()
    create(@Body() createConfigDto: Partial<ConfiguracionSistema>) {
        return this.configuracionService.create(createConfigDto);
    }

    @Get()
    findAll() {
        return this.configuracionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.configuracionService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateConfigDto: Partial<ConfiguracionSistema>) {
        return this.configuracionService.update(+id, updateConfigDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.configuracionService.remove(+id);
    }
}
