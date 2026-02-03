import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../menu/entities/producto.entity';
import { Combo } from '../../menu/entities/combo.entity';

@Entity('detalle_pedido')
export class DetallePedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'pedido_id' })
    pedido_id: number;

    @Column({ name: 'producto_id', nullable: true })
    producto_id: number;

    @Column({ name: 'combo_id', nullable: true })
    combo_id: number;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @ManyToOne(() => Pedido, (pedido) => pedido.detalles)
    @JoinColumn({ name: 'pedido_id' })
    pedido: Pedido;

    @ManyToOne(() => Producto, { nullable: true })
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @ManyToOne(() => Combo, { nullable: true })
    @JoinColumn({ name: 'combo_id' })
    combo: Combo;
}
