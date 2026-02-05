export interface OrderItem {
    nombre: string;
    cantidad: number;
    precio: number;
}

export interface OrderConfirmationData {
    customerName: string;
    customerEmail: string;
    orderId: string;
    orderDate: string;
    items: OrderItem[];
    subtotal: number;
    total: number;
    estimatedTime?: string;
    trackingUrl: string;
}

export interface ReservationConfirmationData {
    customerName: string;
    customerEmail: string;
    reservationId: string;
    reservationDate: string;
    reservationTime: string;
    numberOfGuests: number;
    tableZone?: string;
    manageUrl: string;
}

export interface ReservationCancellationData {
    customerName: string;
    customerEmail: string;
    reservationId: string;
    originalDate: string;
    originalTime: string;
    numberOfGuests: number;
    bookAgainUrl: string;
}

export type OrderStatus = 'En Cocina' | 'Listo' | 'En Camino' | 'Entregado';

export interface OrderStatusUpdateData {
    customerName: string;
    customerEmail: string;
    orderId: string;
    currentStatus: OrderStatus;
    estimatedTime?: string;
    trackingUrl: string;
}
