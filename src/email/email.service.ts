import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import {
    OrderConfirmationData,
    ReservationConfirmationData,
    ReservationCancellationData,
    OrderStatusUpdateData,
} from './dto/email-data.dto';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);
    private templates: Map<string, handlebars.TemplateDelegate> = new Map();

    constructor(private configService: ConfigService) {
        this.initializeTransporter();
        this.loadTemplates();
    }

    private initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
            port: this.configService.get<number>('SMTP_PORT', 587),
            secure: true, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });

        this.logger.log('Email transporter initialized');
    }

    private loadTemplates() {
        const templatesDir = path.join(__dirname, 'templates');
        const templateFiles = [
            'order-confirmation.hbs',
            'reservation-confirmation.hbs',
            'reservation-cancellation.hbs',
            'order-status.hbs',
        ];

        templateFiles.forEach((file) => {
            try {
                const templatePath = path.join(templatesDir, file);
                const templateContent = fs.readFileSync(templatePath, 'utf-8');
                const compiled = handlebars.compile(templateContent);
                const templateName = file.replace('.hbs', '');
                this.templates.set(templateName, compiled);
                this.logger.log(`Template loaded: ${templateName}`);
            } catch (error) {
                this.logger.error(`Failed to load template ${file}:`, error.message);
            }
        });
    }

    private async sendEmail(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        try {
            const from = this.configService.get<string>(
                'SMTP_FROM',
                'Restaurant <noreply@restaurant.com>',
            );

            await this.transporter.sendMail({
                from,
                to,
                subject,
                html,
            });

            this.logger.log(`Email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }

    async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
        const template = this.templates.get('order-confirmation');
        if (!template) {
            throw new Error('Order confirmation template not found');
        }

        const html = template(data);
        await this.sendEmail(
            data.customerEmail,
            `Confirmación de Pedido #${data.orderId}`,
            html,
        );
    }

    async sendReservationConfirmation(
        data: ReservationConfirmationData,
    ): Promise<void> {
        const template = this.templates.get('reservation-confirmation');
        if (!template) {
            throw new Error('Reservation confirmation template not found');
        }

        const html = template(data);
        await this.sendEmail(
            data.customerEmail,
            `Reserva Confirmada - ${data.reservationDate}`,
            html,
        );
    }

    async sendReservationCancellation(
        data: ReservationCancellationData,
    ): Promise<void> {
        const template = this.templates.get('reservation-cancellation');
        if (!template) {
            throw new Error('Reservation cancellation template not found');
        }

        const html = template(data);
        await this.sendEmail(
            data.customerEmail,
            'Reserva Cancelada',
            html,
        );
    }

    async sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<void> {
        const template = this.templates.get('order-status');
        if (!template) {
            throw new Error('Order status template not found');
        }

        const html = template(data);
        await this.sendEmail(
            data.customerEmail,
            `Actualización de Pedido #${data.orderId} - ${data.currentStatus}`,
            html,
        );
    }
}
