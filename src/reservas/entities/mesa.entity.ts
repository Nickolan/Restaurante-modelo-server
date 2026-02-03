import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Zona } from './zona.entity';
import { Reserva } from './reserva.entity';

@Entity('mesa')
export class Mesa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    numero_mesa: number;

    @Column({ type: 'int' })
    capacidad: number;

    @Column({ type: 'varchar', length: 50 })
    estado: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ name: 'zona_id' })
    zona_id: number;

    @ManyToOne(() => Zona, (zona) => zona.mesas)
    @JoinColumn({ name: 'zona_id' })
    zona: Zona;

    @OneToMany(() => Reserva, (reserva) => reserva.mesa)
    reservas: Reserva[];
}
