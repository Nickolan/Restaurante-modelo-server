import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoReserva, Reserva } from './entities/reserva.entity';
import { Mesa } from './entities/mesa.entity';
import { Zona } from './entities/zona.entity';
import { TurnoConfig } from './entities/turno-config.entity';

@Injectable()
export class ReservasService {
    constructor(
        @InjectRepository(Reserva)
        private reservaRepository: Repository<Reserva>,
        @InjectRepository(Mesa)
        private mesaRepository: Repository<Mesa>,
        @InjectRepository(Zona)
        private zonaRepository: Repository<Zona>,
        @InjectRepository(TurnoConfig)
        private turnoConfigRepository: Repository<TurnoConfig>,
    ) { }

    /**
     * Get available time slots for a specific date
     * @param date - Date in format YYYY-MM-DD
     * @returns Array of available time slots (hora_spot) for that day
     */
    async getAvailableSpots(date: string): Promise<string[]> {
        // Convert date string to Date object and get day of week
        const dateObj = new Date(date);
        const dayOfWeek = this.getDayOfWeekInSpanish(dateObj);

        // Query TurnoConfig for all time slots for this day
        const turnos = await this.turnoConfigRepository.find({
            where: { dia_semana: dayOfWeek },
            select: ['hora_spot'],
        });

        // Return array of hora_spot values
        return turnos.map(turno => turno.hora_spot);
    }

    /**
     * Get available tables for a specific date, time, zone, and number of guests
     * @param date - Date in format YYYY-MM-DD
     * @param time - Time in format HH:MM:SS
     * @param zoneId - Zone ID
     * @param guests - Number of guests
     * @returns Array of available Mesa entities
     */
    async getAvailableTables(
        date: string,
        time: string,
        zoneId: number,
        guests: number,
    ): Promise<Mesa[]> {
        // Use QueryBuilder to find tables that:
        // 1. Belong to the specified zone
        // 2. Have capacity >= guests
        // 3. Do NOT have a reservation for the given date and time
        const availableTables = await this.mesaRepository
            .createQueryBuilder('mesa')
            .where('mesa.zona_id = :zoneId', { zoneId })
            .andWhere('mesa.capacidad >= :guests', { guests })
            .andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('reserva.mesa_id')
                    .from(Reserva, 'reserva')
                    .innerJoin('reserva.turno', 'turno')
                    .where('reserva.fecha_reserva = :date', { date })
                    .andWhere('turno.hora_spot = :time', { time })
                    .getQuery();
                return `mesa.id NOT IN ${subQuery}`;
            })
            .leftJoinAndSelect('mesa.zona', 'zona')
            .getMany();

        return availableTables;
    }

    /**
     * Create a new reservation with race condition protection
     * @param createReservaDto - Reservation data
     * @returns Created Reserva entity
     */
    async createReserva(createReservaDto: Partial<Reserva>): Promise<Reserva> {
        // 1. Validaciones de campos requeridos
        if (!createReservaDto.mesa_id || !createReservaDto.turno_id || !createReservaDto.fecha_reserva) {
            throw new BadRequestException('mesa_id, turno_id y fecha_reserva son requeridos');
        }

        // 2. Obtener Turno
        const turno = await this.turnoConfigRepository.findOne({
            where: { id: createReservaDto.turno_id },
        });

        if (!turno) {
            throw new NotFoundException(`Turno con ID ${createReservaDto.turno_id} no encontrado`);
        }

        // 3. Obtener Mesa
        const mesa = await this.mesaRepository.findOne({
            where: { id: createReservaDto.mesa_id },
        });

        if (!mesa) {
            throw new NotFoundException(`Mesa con ID ${createReservaDto.mesa_id} no encontrada`);
        }

        // 4. Lógica de Disponibilidad (Doble chequeo)
        const dateStr = createReservaDto.fecha_reserva instanceof Date
            ? createReservaDto.fecha_reserva.toISOString().split('T')[0]
            : String(createReservaDto.fecha_reserva).split('T')[0];

        const availableTables = await this.getAvailableTables(
            dateStr,
            turno.hora_spot,
            mesa.zona_id,
            createReservaDto.numero_personas || 1,
        );

        const isTableAvailable = availableTables.some(table => table.id === createReservaDto.mesa_id);

        if (!isTableAvailable) {
            throw new BadRequestException(
                'La mesa no está disponible para la fecha y hora seleccionadas. Puede haber sido reservada recientemente.',
            );
        }

        // --- NUEVA LÓGICA: Generación automática del número de reserva ---
        const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // Ej: 260127
        const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // Ej: 4X9Z
        const nroReserva = `RES-${fecha}-${random}`; // Ej: RES-260127-4X9Z

        // Asignamos el número generado al DTO
        createReservaDto.numero_reserva = nroReserva;

        createReservaDto.estado = EstadoReserva.PENDIENTE;
        // ---------------------------------------------------------------

        // 5. Crear y guardar
        const reserva = this.reservaRepository.create(createReservaDto);
        return this.reservaRepository.save(reserva);
    }

    async findAllReservas(): Promise<Reserva[]> {
        return this.reservaRepository.find({ relations: ['mesa', 'turno'] });
    }

    async findOneReserva(id: number): Promise<Reserva> {
        const reserva = await this.reservaRepository.findOne({
            where: { id },
            relations: ['mesa', 'turno'],
        });
        if (!reserva) {
            throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
        }
        return reserva;
    }

    async updateReserva(id: number, updateReservaDto: Partial<Reserva>): Promise<Reserva> {
        await this.findOneReserva(id);
        await this.reservaRepository.update(id, updateReservaDto);
        return this.findOneReserva(id);
    }

    async removeReserva(id: number): Promise<void> {
        const result = await this.reservaRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
        }
    }

    // Mesa CRUD
    async createMesa(createMesaDto: Partial<Mesa>): Promise<Mesa> {
        const mesa = this.mesaRepository.create(createMesaDto);
        return this.mesaRepository.save(mesa);
    }

    async findAllMesas(): Promise<Mesa[]> {
        return this.mesaRepository.find({ relations: ['zona'] });
    }

    async findOneMesa(id: number): Promise<Mesa> {
        const mesa = await this.mesaRepository.findOne({
            where: { id },
            relations: ['zona'],
        });
        if (!mesa) {
            throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
        }
        return mesa;
    }

    async updateMesa(id: number, updateMesaDto: Partial<Mesa>): Promise<Mesa> {
        await this.findOneMesa(id);
        await this.mesaRepository.update(id, updateMesaDto);
        return this.findOneMesa(id);
    }

    async removeMesa(id: number): Promise<void> {
        const result = await this.mesaRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
        }
    }

    // Zona CRUD
    async createZona(createZonaDto: Partial<Zona>): Promise<Zona> {
        const zona = this.zonaRepository.create(createZonaDto);
        return this.zonaRepository.save(zona);
    }

    async findAllZonas(): Promise<Zona[]> {
        return this.zonaRepository.find();
    }

    async findOneZona(id: number): Promise<Zona> {
        const zona = await this.zonaRepository.findOne({ where: { id } });
        if (!zona) {
            throw new NotFoundException(`Zona con ID ${id} no encontrada`);
        }
        return zona;
    }

    async updateZona(id: number, updateZonaDto: Partial<Zona>): Promise<Zona> {
        await this.findOneZona(id);
        await this.zonaRepository.update(id, updateZonaDto);
        return this.findOneZona(id);
    }

    async removeZona(id: number): Promise<void> {
        const result = await this.zonaRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Zona con ID ${id} no encontrada`);
        }
    }

    // TurnoConfig CRUD
    async createTurnoConfig(createTurnoDto: Partial<TurnoConfig>): Promise<TurnoConfig> {
        const turno = this.turnoConfigRepository.create(createTurnoDto);
        return this.turnoConfigRepository.save(turno);
    }

    async findAllTurnos(): Promise<TurnoConfig[]> {
        return this.turnoConfigRepository.find();
    }

    async findOneTurno(id: number): Promise<TurnoConfig> {
        const turno = await this.turnoConfigRepository.findOne({ where: { id } });
        if (!turno) {
            throw new NotFoundException(`Turno con ID ${id} no encontrada`);
        }
        return turno;
    }

    async updateTurno(id: number, updateTurnoDto: Partial<TurnoConfig>): Promise<TurnoConfig> {
        await this.findOneTurno(id);
        await this.turnoConfigRepository.update(id, updateTurnoDto);
        return this.findOneTurno(id);
    }

    async removeTurno(id: number): Promise<void> {
        const result = await this.turnoConfigRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Turno con ID ${id} no encontrada`);
        }
    }

    // Special query: Find reservation by DNI and numero_reserva
    async findByDniAndNumero(dni_cliente: string, numero_reserva: string): Promise<Reserva> {
        const reserva = await this.reservaRepository.findOne({
            where: { dni_cliente, numero_reserva },
            relations: ['mesa', 'turno', 'mesa.zona'],
        });
        if (!reserva) {
            throw new NotFoundException('Reserva no encontrada');
        }
        return reserva;
    }

    /**
     * Helper method to convert Date object to Spanish day of week
     * @param date - Date object
     * @returns Spanish day name (e.g., "Lunes", "Martes")
     */
    private getDayOfWeekInSpanish(date: Date): string {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[date.getDay()];
    }
}
