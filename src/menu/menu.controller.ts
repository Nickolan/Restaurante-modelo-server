import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuService } from './menu.service';
import { Categoria } from './entities/categoria.entity';
import { Producto } from './entities/producto.entity';
import { Combo } from './entities/combo.entity';
import { ComboProductos } from './entities/combo-productos.entity';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    // Categoria endpoints
    @Post('categoria')
    createCategoria(@Body() createCategoriaDto: Partial<Categoria>) {
        return this.menuService.createCategoria(createCategoriaDto);
    }

    @Get('categoria')
    findAllCategorias() {
        return this.menuService.findAllCategorias();
    }

    @Get('categoria/:id')
    findOneCategoria(@Param('id') id: string) {
        return this.menuService.findOneCategoria(+id);
    }

    @Patch('categoria/:id')
    updateCategoria(@Param('id') id: string, @Body() updateCategoriaDto: Partial<Categoria>) {
        return this.menuService.updateCategoria(+id, updateCategoriaDto);
    }

    @Delete('categoria/:id')
    removeCategoria(@Param('id') id: string) {
        return this.menuService.removeCategoria(+id);
    }

    // Producto endpoints
    @Post('producto')
    @UseInterceptors(FileInterceptor('image'))
    createProducto(
        @Body() createProductoDto: Partial<Producto>,
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File,
    ) {
        return this.menuService.createProducto(createProductoDto, file);
    }

    @Get('producto')
    findAllProductos() {
        return this.menuService.findAllProductos();
    }

    @Get('producto/:id')
    findOneProducto(@Param('id') id: string) {
        return this.menuService.findOneProducto(+id);
    }

    @Patch('producto/:id')
    @UseInterceptors(FileInterceptor('image'))
    updateProducto(
        @Param('id') id: string,
        @Body() updateProductoDto: Partial<Producto>,
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File,
    ) {
        return this.menuService.updateProducto(+id, updateProductoDto, file);
    }

    @Delete('producto/:id')
    removeProducto(@Param('id') id: string) {
        return this.menuService.removeProducto(+id);
    }

    // Combo endpoints
    @Post('combo')
    createCombo(@Body() createComboDto: Partial<Combo>) {
        return this.menuService.createCombo(createComboDto);
    }

    @Get('combo')
    findAllCombos() {
        return this.menuService.findAllCombos();
    }

    @Get('combo/:id')
    findOneCombo(@Param('id') id: string) {
        return this.menuService.findOneCombo(+id);
    }

    @Patch('combo/:id')
    updateCombo(@Param('id') id: string, @Body() updateComboDto: Partial<Combo>) {
        return this.menuService.updateCombo(+id, updateComboDto);
    }

    @Delete('combo/:id')
    removeCombo(@Param('id') id: string) {
        return this.menuService.removeCombo(+id);
    }

    // ComboProductos endpoints
    @Post('combo-producto')
    createComboProducto(@Body() createComboProductoDto: Partial<ComboProductos>) {
        return this.menuService.createComboProducto(createComboProductoDto);
    }

    @Get('combo-producto')
    findAllComboProductos() {
        return this.menuService.findAllComboProductos();
    }

    @Get('combo-producto/:id')
    findOneComboProducto(@Param('id') id: string) {
        return this.menuService.findOneComboProducto(+id);
    }

    @Patch('combo-producto/:id')
    updateComboProducto(@Param('id') id: string, @Body() updateComboProductoDto: Partial<ComboProductos>) {
        return this.menuService.updateComboProducto(+id, updateComboProductoDto);
    }

    @Delete('combo-producto/:id')
    removeComboProducto(@Param('id') id: string) {
        return this.menuService.removeComboProducto(+id);
    }
}
