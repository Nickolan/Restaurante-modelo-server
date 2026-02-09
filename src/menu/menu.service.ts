import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { Producto } from './entities/producto.entity';
import { Combo } from './entities/combo.entity';
import { ComboProductos } from './entities/combo-productos.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(Categoria)
        private categoriaRepository: Repository<Categoria>,
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,
        @InjectRepository(Combo)
        private comboRepository: Repository<Combo>,
        @InjectRepository(ComboProductos)
        private comboProductosRepository: Repository<ComboProductos>,
        private cloudinaryService: CloudinaryService,
    ) { }

    // Categoria CRUD
    async createCategoria(createCategoriaDto: Partial<Categoria>): Promise<Categoria> {
        const categoria = this.categoriaRepository.create(createCategoriaDto);
        return this.categoriaRepository.save(categoria);
    }

    async findAllCategorias(): Promise<Categoria[]> {
        return this.categoriaRepository.find({ relations: ['productos'] });
    }

    async findOneCategoria(id: number): Promise<Categoria> {
        const categoria = await this.categoriaRepository.findOne({
            where: { id },
            relations: ['productos'],
        });
        if (!categoria) {
            throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
        }
        return categoria;
    }

    async updateCategoria(id: number, updateCategoriaDto: Partial<Categoria>): Promise<Categoria> {
        await this.findOneCategoria(id);
        await this.categoriaRepository.update(id, updateCategoriaDto);
        return this.findOneCategoria(id);
    }

    async removeCategoria(id: number): Promise<void> {
        const result = await this.categoriaRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
        }
    }

    // Producto CRUD
    async createProducto(
        createProductoDto: Partial<Producto>,
        file?: Express.Multer.File,
    ): Promise<Producto> {
        if (file) {
            const imageUrl = await this.cloudinaryService.uploadImage(file, 'restaurant_menu');
            createProductoDto.imagen = imageUrl;
        }
        const producto = this.productoRepository.create(createProductoDto);
        return this.productoRepository.save(producto);
    }

    async findAllProductos(): Promise<Producto[]> {
        return this.productoRepository.find({ relations: ['categoria'] });
    }

    async findOneProducto(id: number): Promise<Producto> {
        const producto = await this.productoRepository.findOne({
            where: { id },
            relations: ['categoria'],
        });
        if (!producto) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return producto;
    }

    async updateProducto(
        id: number,
        updateProductoDto: Partial<Producto>,
        file?: Express.Multer.File,
    ): Promise<Producto> {
        await this.findOneProducto(id);
        if (file) {
            const imageUrl = await this.cloudinaryService.uploadImage(file, 'restaurant_menu');
            updateProductoDto.imagen = imageUrl;
        }
        await this.productoRepository.update(id, updateProductoDto);
        return this.findOneProducto(id);
    }

    async removeProducto(id: number): Promise<void> {
        const result = await this.productoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
    }

    // Combo CRUD
    async createCombo(createComboDto: Partial<Combo>): Promise<Combo> {
        const combo = this.comboRepository.create(createComboDto);
        return this.comboRepository.save(combo);
    }

    async findAllCombos(): Promise<Combo[]> {
        return this.comboRepository.find({ relations: ['comboProductos', 'comboProductos.producto'] });
    }

    async findOneCombo(id: number): Promise<Combo> {
        const combo = await this.comboRepository.findOne({
            where: { id },
            relations: ['comboProductos', 'comboProductos.producto'],
        });
        if (!combo) {
            throw new NotFoundException(`Combo con ID ${id} no encontrado`);
        }
        return combo;
    }

    async updateCombo(id: number, updateComboDto: Partial<Combo>): Promise<Combo> {
        await this.findOneCombo(id);
        await this.comboRepository.update(id, updateComboDto);
        return this.findOneCombo(id);
    }

    async removeCombo(id: number): Promise<void> {
        const result = await this.comboRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Combo con ID ${id} no encontrado`);
        }
    }

    // ComboProductos CRUD
    async createComboProducto(createComboProductoDto: Partial<ComboProductos>): Promise<ComboProductos> {
        const comboProducto = this.comboProductosRepository.create(createComboProductoDto);
        return this.comboProductosRepository.save(comboProducto);
    }

    async findAllComboProductos(): Promise<ComboProductos[]> {
        return this.comboProductosRepository.find({ relations: ['combo', 'producto'] });
    }

    async findOneComboProducto(id: number): Promise<ComboProductos> {
        const comboProducto = await this.comboProductosRepository.findOne({
            where: { id },
            relations: ['combo', 'producto'],
        });
        if (!comboProducto) {
            throw new NotFoundException(`ComboProducto con ID ${id} no encontrado`);
        }
        return comboProducto;
    }

    async updateComboProducto(id: number, updateComboProductoDto: Partial<ComboProductos>): Promise<ComboProductos> {
        await this.findOneComboProducto(id);
        await this.comboProductosRepository.update(id, updateComboProductoDto);
        return this.findOneComboProducto(id);
    }

    async removeComboProducto(id: number): Promise<void> {
        const result = await this.comboProductosRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`ComboProducto con ID ${id} no encontrado`);
        }
    }
}
