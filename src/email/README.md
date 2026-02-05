# Email Service Module

Professional email service for the Restaurant Web App using Nodemailer and Handlebars.

## Features

✅ **Four Email Templates:**
- Order Confirmation
- Reservation Confirmation  
- Reservation Cancellation
- Order Status Updates (with progress bar)

✅ **Design System:**
- Dark mode glassmorphism aesthetic
- Matches frontend visual identity
- Responsive (mobile-friendly)
- Inline CSS for email client compatibility

✅ **Tech Stack:**
- Nodemailer for SMTP
- Handlebars for templating
- TypeScript for type safety

## Quick Start

### 1. Configure SMTP

Update `.env` with your email credentials:

```bash
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

For Gmail, generate an app password at: https://myaccount.google.com/apppasswords

### 2. Inject EmailService

```typescript
import { EmailService } from '../email/email.service';

constructor(private readonly emailService: EmailService) {}
```

### 3. Send Emails

```typescript
await this.emailService.sendOrderConfirmation({
  customerName: 'Juan Pérez',
  customerEmail: 'juan@example.com',
  orderId: '12345',
  orderDate: new Date().toLocaleDateString('es-ES'),
  items: [
    { nombre: 'Pizza', cantidad: 2, precio: 15.99 }
  ],
  subtotal: 31.98,
  total: 31.98,
  trackingUrl: 'https://restaurant.com/track/12345',
});
```

## Available Methods

- `sendOrderConfirmation(data: OrderConfirmationData)`
- `sendReservationConfirmation(data: ReservationConfirmationData)`
- `sendReservationCancellation(data: ReservationCancellationData)`
- `sendOrderStatusUpdate(data: OrderStatusUpdateData)`

## Templates

All templates located in `src/email/templates/`:
- `order-confirmation.hbs`
- `reservation-confirmation.hbs`
- `reservation-cancellation.hbs`
- `order-status.hbs`

## Examples

See `email.examples.ts` for comprehensive usage examples.

## Color Scheme

- Background: `#121212`
- Container: `#1E1E1E`
- Primary Text: `#FFFFFF` / `#E0E0E0`
- Accent/Buttons: `#FFA500`
- Borders: `rgba(255, 255, 255, 0.1)`
