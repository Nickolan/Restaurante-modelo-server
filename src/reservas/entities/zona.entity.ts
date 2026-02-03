import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Mesa } from './mesa.entity';

@Entity('zona')
export class Zona {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    nombre: string;

    @OneToMany(() => Mesa, (mesa) => mesa.zona)
    mesas: Mesa[];
}
