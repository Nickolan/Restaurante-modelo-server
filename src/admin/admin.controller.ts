import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    async getDashboardStats(): Promise<DashboardStatsDto> {
        return await this.adminService.getDashboardStats();
    }
}
