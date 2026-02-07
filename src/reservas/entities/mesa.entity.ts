import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Zona } from './zona.entity';
import { Reserva } from './reserva.entity';

export enum EstadoMesa {
  DISPONIBLE = 'disponible',
  BLOQUEDA = 'bloqueada', // Cuando Mercado Pago avisa que se pagó
}

@Entity('mesa')
export class Mesa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    numero_mesa: number;

    @Column({ type: 'int' })
    capacidad: number;

    @Column({
        type: 'enum',
        enum: EstadoMesa,
        default: EstadoMesa.DISPONIBLE
    })
    estado: EstadoMesa;

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
