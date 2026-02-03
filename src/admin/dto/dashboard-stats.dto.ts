import { Pedido } from '../../pedidos/entities/pedido.entity';

export class DashboardStatsDto {
    ventasHoy: number;
    pedidosPendientes: number;
    reservasHoy: number;
    clientesUnicos: number;
    ultimosPedidos: Pedido[];
}
