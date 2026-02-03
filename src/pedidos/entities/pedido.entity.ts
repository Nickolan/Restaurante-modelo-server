import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetallePedido } from './detalle-pedido.entity';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado', // Cuando Mercado Pago avisa que se pagó
  ENCOCINA = 'en cocina',   // Si el usuario cancela o el pago falla
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
  FALLADO = 'fallado'
}

@Entity('pedido')
export class Pedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    numero_orden: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @Column({ type: 'varchar', length: 255 })
    nombre_cliente: string;

    @Column({ type: 'varchar', length: 20 })
    dni_cliente: string;

    @Column({ type: 'varchar', length: 255 })
    correo: string;

    @Column({ type: 'text', nullable: true })
    direccion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({
        type: 'enum',
        enum: EstadoPedido,
        default: EstadoPedido.PENDIENTE
    })
    estado: EstadoPedido;

    @OneToMany(() => DetallePedido, (detalle) => detalle.pedido)
    detalles: DetallePedido[];
}
