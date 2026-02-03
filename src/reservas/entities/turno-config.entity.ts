import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reserva } from './reserva.entity';

@Entity('turno_config')
export class TurnoConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    dia_semana: string;

    @Column({ type: 'time' })
    hora_spot: string;

    @OneToMany(() => Reserva, (reserva) => reserva.turno)
    reservas: Reserva[];
}
