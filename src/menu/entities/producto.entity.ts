import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Categoria } from './categoria.entity';
import { ComboProductos } from './combo-productos.entity';

@Entity('producto')
export class Producto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio: number;

    @Column({ type: 'varchar', length: 500, nullable: true })
    imagen: string;

    @Column({ name: 'categoria_id' })
    categoria_id: number;

    @ManyToOne(() => Categoria, (categoria) => categoria.productos)
    @JoinColumn({ name: 'categoria_id' })
    categoria: Categoria;

    @OneToMany(() => ComboProductos, (comboProductos) => comboProductos.producto)
    comboProductos: ComboProductos[];
}
