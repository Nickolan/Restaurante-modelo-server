import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';

@Injectable()
export class ConfiguracionService {
    constructor(
        @InjectRepository(ConfiguracionSistema)
        private configuracionRepository: Repository<ConfiguracionSistema>,
    ) { }

    async create(createConfigDto: Partial<ConfiguracionSistema>): Promise<ConfiguracionSistema> {
        const config = this.configuracionRepository.create(createConfigDto);
        return this.configuracionRepository.save(config);
    }

    async findAll(): Promise<ConfiguracionSistema[]> {
        return this.configuracionRepository.find();
    }

    async findOne(id: number): Promise<ConfiguracionSistema> {
        const config = await this.configuracionRepository.findOne({ where: { id } });
        if (!config) {
            throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
        }
        return config;
    }

    async update(id: number, updateConfigDto: Partial<ConfiguracionSistema>): Promise<ConfiguracionSistema> {
        await this.findOne(id);
        await this.configuracionRepository.update(id, updateConfigDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const result = await this.configuracionRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
        }
    }
}
