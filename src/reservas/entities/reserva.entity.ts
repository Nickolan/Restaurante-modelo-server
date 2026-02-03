import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Mesa } from './mesa.entity';
import { TurnoConfig } from './turno-config.entity';

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada', // Cuando Mercado Pago avisa que se pagó
  CANCELADA = 'cancelada',   // Si el usuario cancela o el pago falla
  FINALIZADA = 'finalizada'  // Cuando el cliente ya comió y se fue
}

@Entity('reserva')
export class Reserva {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    numero_reserva: string;

    @Column({ type: 'varchar', length: 255 })
    nombre_cliente: string;

    @Column({ type: 'varchar', length: 20 })
    dni_cliente: string;

    @Column({ type: 'varchar', length: 255 })
    correo_cliente: string;

    @Column({ type: 'date' })
    fecha_reserva: Date;

    @Column({ name: 'turno_id' })
    turno_id: number;

    @Column({ type: 'int' })
    numero_personas: number;

    @Column({ name: 'mesa_id' })
    mesa_id: number;

    @Column({
        type: 'enum',
        enum: EstadoReserva,
        default: EstadoReserva.PENDIENTE
    })
    estado: EstadoReserva;

    @ManyToOne(() => TurnoConfig, (turno) => turno.reservas)
    @JoinColumn({ name: 'turno_id' })
    turno: TurnoConfig;

    @ManyToOne(() => Mesa, (mesa) => mesa.reservas)
    @JoinColumn({ name: 'mesa_id' })
    mesa: Mesa;
}
