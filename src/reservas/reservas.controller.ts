import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { Reserva } from './entities/reserva.entity';
import { Mesa } from './entities/mesa.entity';
import { Zona } from './entities/zona.entity';
import { TurnoConfig } from './entities/turno-config.entity';

@Controller('reservas')
export class ReservasController {
    constructor(private readonly reservasService: ReservasService) { }

    // Reserva endpoints
    @Post('reserva')
    createReserva(@Body() createReservaDto: Partial<Reserva>) {
        console.log(createReservaDto);
        
        return this.reservasService.createReserva(createReservaDto);
    }

    @Get('reserva')
    findAllReservas() {
        return this.reservasService.findAllReservas();
    }

    @Get('reserva/:id')
    findOneReserva(@Param('id') id: string) {
        return this.reservasService.findOneReserva(+id);
    }

    @Patch('reserva/:id')
    updateReserva(@Param('id') id: string, @Body() updateReservaDto: Partial<Reserva>) {
        return this.reservasService.updateReserva(+id, updateReservaDto);
    }

    @Delete('reserva/:id')
    removeReserva(@Param('id') id: string) {
        return this.reservasService.removeReserva(+id);
    }

    // Special endpoint: Query reservation by DNI and numero_reserva
    @Get('buscar')
    findByDniAndNumero(@Query('dni') dni: string, @Query('numero') numero: string) {
        return this.reservasService.findByDniAndNumero(dni, numero);
    }

    // Availability endpoints
    /**
     * Get available time slots for a specific date
     * GET /reservas/disponibilidad/horarios?fecha=2026-01-28
     */
    @Get('disponibilidad/horarios')
    getAvailableSpots(@Query('fecha') fecha: string) {
        return this.reservasService.getAvailableSpots(fecha);
    }

    /**
     * Get available tables for a specific date, time, zone, and number of guests
     * GET /reservas/disponibilidad/mesas?fecha=2026-01-28&hora=19:00:00&zona_id=1&personas=4
     */
    @Get('disponibilidad/mesas')
    getAvailableTables(
        @Query('fecha') fecha: string,
        @Query('hora') hora: string,
        @Query('zona_id') zona_id: string,
        @Query('personas') personas: string,
    ) {
        return this.reservasService.getAvailableTables(
            fecha,
            hora,
            +zona_id,
            +personas,
        );
    }

    // Mesa endpoints
    @Post('mesa')
    createMesa(@Body() createMesaDto: Partial<Mesa>) {
        return this.reservasService.createMesa(createMesaDto);
    }

    @Get('mesa')
    findAllMesas() {
        return this.reservasService.findAllMesas();
    }

    @Get('mesa/:id')
    findOneMesa(@Param('id') id: string) {
        return this.reservasService.findOneMesa(+id);
    }

    @Patch('mesa/:id')
    updateMesa(@Param('id') id: string, @Body() updateMesaDto: Partial<Mesa>) {
        return this.reservasService.updateMesa(+id, updateMesaDto);
    }

    @Delete('mesa/:id')
    removeMesa(@Param('id') id: string) {
        return this.reservasService.removeMesa(+id);
    }

    // Zona endpoints
    @Post('zona')
    createZona(@Body() createZonaDto: Partial<Zona>) {
        return this.reservasService.createZona(createZonaDto);
    }

    @Get('zona')
    findAllZonas() {
        return this.reservasService.findAllZonas();
    }

    @Get('zona/:id')
    findOneZona(@Param('id') id: string) {
        return this.reservasService.findOneZona(+id);
    }

    @Patch('zona/:id')
    updateZona(@Param('id') id: string, @Body() updateZonaDto: Partial<Zona>) {
        return this.reservasService.updateZona(+id, updateZonaDto);
    }

    @Delete('zona/:id')
    removeZona(@Param('id') id: string) {
        return this.reservasService.removeZona(+id);
    }

    // TurnoConfig endpoints
    @Post('turno')
    createTurno(@Body() createTurnoDto: Partial<TurnoConfig>) {
        return this.reservasService.createTurnoConfig(createTurnoDto);
    }

    @Get('turno')
    findAllTurnos() {
        return this.reservasService.findAllTurnos();
    }

    @Get('turno/:id')
    findOneTurno(@Param('id') id: string) {
        return this.reservasService.findOneTurno(+id);
    }

    @Patch('turno/:id')
    updateTurno(@Param('id') id: string, @Body() updateTurnoDto: Partial<TurnoConfig>) {
        return this.reservasService.updateTurno(+id, updateTurnoDto);
    }

    @Delete('turno/:id')
    removeTurno(@Param('id') id: string) {
        return this.reservasService.removeTurno(+id);
    }
}
