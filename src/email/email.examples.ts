import { EmailService } from './email.service';
import {
    OrderConfirmationData,
    ReservationConfirmationData,
    ReservationCancellationData,
    OrderStatusUpdateData,
} from './dto/email-data.dto';

/**
 * USAGE EXAMPLES FOR EMAIL SERVICE
 * 
 * This file demonstrates how to use the EmailService in your controllers/services.
 * Simply inject EmailService into your constructor and call the appropriate methods.
 */

// Example 1: Send Order Confirmation Email
export async function sendOrderConfirmationExample(emailService: EmailService) {
    const orderData: OrderConfirmationData = {
        customerName: 'Juan Pérez',
        customerEmail: 'juan.perez@example.com',
        orderId: 'ORD-12345',
        orderDate: '4 de Febrero, 2026',
        items: [
            { nombre: 'Pizza Margherita', cantidad: 2, precio: 15.99 },
            { nombre: 'Ensalada César', cantidad: 1, precio: 8.50 },
            { nombre: 'Coca-Cola', cantidad: 2, precio: 3.00 },
        ],
        subtotal: 43.48,
        total: 46.48,
        estimatedTime: '30-45 minutos',
        trackingUrl: 'https://restaurant.com/track/ORD-12345',
    };

    await emailService.sendOrderConfirmation(orderData);
}

// Example 2: Send Reservation Confirmation Email
export async function sendReservationConfirmationExample(emailService: EmailService) {
    const reservationData: ReservationConfirmationData = {
        customerName: 'María García',
        customerEmail: 'maria.garcia@example.com',
        reservationId: 'RES-67890',
        reservationDate: '10 de Febrero, 2026',
        reservationTime: '20:00',
        numberOfGuests: 4,
        tableZone: 'Terraza',
        manageUrl: 'https://restaurant.com/reservations/RES-67890',
    };

    await emailService.sendReservationConfirmation(reservationData);
}

// Example 3: Send Reservation Cancellation Email
export async function sendReservationCancellationExample(emailService: EmailService) {
    const cancellationData: ReservationCancellationData = {
        customerName: 'Carlos Rodríguez',
        customerEmail: 'carlos.rodriguez@example.com',
        reservationId: 'RES-11111',
        originalDate: '15 de Febrero, 2026',
        originalTime: '19:30',
        numberOfGuests: 2,
        bookAgainUrl: 'https://restaurant.com/reservations/new',
    };

    await emailService.sendReservationCancellation(cancellationData);
}

// Example 4: Send Order Status Update Email
export async function sendOrderStatusUpdateExample(emailService: EmailService) {
    const statusData: OrderStatusUpdateData = {
        customerName: 'Ana Martínez',
        customerEmail: 'ana.martinez@example.com',
        orderId: 'ORD-22222',
        currentStatus: 'En Camino',
        estimatedTime: '15 minutos',
        trackingUrl: 'https://restaurant.com/track/ORD-22222',
    };

    await emailService.sendOrderStatusUpdate(statusData);
}

/**
 * INTEGRATION EXAMPLE IN A CONTROLLER
 * 
 * Here's how to inject and use EmailService in your PedidosController or ReservasController:
 */

/*
import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly emailService: EmailService, // <-- Inject EmailService
  ) {}

  @Post()
  async create(@Body() createPedidoDto: CreatePedidoDto) {
    // 1. Create the order
    const pedido = await this.pedidosService.create(createPedidoDto);

    // 2. Send confirmation email
    await this.emailService.sendOrderConfirmation({
      customerName: pedido.cliente.nombre,
      customerEmail: pedido.cliente.email,
      orderId: pedido.id.toString(),
      orderDate: new Date(pedido.fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      items: pedido.items.map(item => ({
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio: item.precio_unitario,
      })),
      subtotal: pedido.total,
      total: pedido.total,
      estimatedTime: '30-45 minutos',
      trackingUrl: `${process.env.FRONTEND_URL}/track/${pedido.id}`,
    });

    return pedido;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: OrderStatus },
  ) {
    // 1. Update order status
    const pedido = await this.pedidosService.updateStatus(id, updateStatusDto.status);

    // 2. Send status update email
    await this.emailService.sendOrderStatusUpdate({
      customerName: pedido.cliente.nombre,
      customerEmail: pedido.cliente.email,
      orderId: pedido.id.toString(),
      currentStatus: updateStatusDto.status,
      estimatedTime: this.getEstimatedTime(updateStatusDto.status),
      trackingUrl: `${process.env.FRONTEND_URL}/track/${pedido.id}`,
    });

    return pedido;
  }

  private getEstimatedTime(status: OrderStatus): string {
    switch (status) {
      case 'En Cocina':
        return '20-30 minutos';
      case 'Listo':
        return '10 minutos';
      case 'En Camino':
        return '15 minutos';
      default:
        return '';
    }
  }
}
*/

/**
 * SMTP CONFIGURATION INSTRUCTIONS
 * 
 * To use Gmail:
 * 1. Go to your Google Account settings
 * 2. Enable 2-Step Verification
 * 3. Go to Security > App passwords
 * 4. Generate a new app password for "Mail"
 * 5. Update .env file:
 *    SMTP_USER=your-email@gmail.com
 *    SMTP_PASS=your-16-character-app-password
 * 
 * Alternative SMTP Providers:
 * - SendGrid: SMTP_HOST=smtp.sendgrid.net, SMTP_PORT=587
 * - Mailgun: SMTP_HOST=smtp.mailgun.org, SMTP_PORT=587
 * - AWS SES: SMTP_HOST=email-smtp.us-east-1.amazonaws.com, SMTP_PORT=587
 */
