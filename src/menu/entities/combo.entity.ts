import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ComboProductos } from './combo-productos.entity';

@Entity('combo')
export class Combo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    nombre: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_combo: number;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @OneToMany(() => ComboProductos, (comboProductos) => comboProductos.combo)
    comboProductos: ComboProductos[];
}
