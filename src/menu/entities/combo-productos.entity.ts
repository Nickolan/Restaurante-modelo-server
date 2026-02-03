import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Combo } from './combo.entity';
import { Producto } from './producto.entity';

@Entity('combo_productos')
export class ComboProductos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'combo_id' })
    combo_id: number;

    @Column({ name: 'producto_id' })
    producto_id: number;

    @Column({ type: 'int' })
    cantidad: number;

    @ManyToOne(() => Combo, (combo) => combo.comboProductos)
    @JoinColumn({ name: 'combo_id' })
    combo: Combo;

    @ManyToOne(() => Producto, (producto) => producto.comboProductos)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;
}
