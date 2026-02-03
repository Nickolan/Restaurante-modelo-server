import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('configuracion_sistema')
export class ConfiguracionSistema {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'time' })
    horario_apertura: string;

    @Column({ type: 'time' })
    horario_cierre: string;

    @Column({ type: 'boolean', default: false })
    bloqueo_pedidos: boolean;
}
