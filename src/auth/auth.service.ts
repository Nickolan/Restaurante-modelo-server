import {
    Injectable,
    UnauthorizedException,
    OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Seed default admin user on module initialization if database is empty
     */
    async onModuleInit() {
        const userCount = await this.usersService.count();

        if (userCount === 0) {
            await this.usersService.create({
                email: 'admin@restaurante.com',
                password: 'admin123',
                fullName: 'Admin User',
                role: UserRole.ADMIN,
            });
            console.log('✅ Default admin user created: admin@restaurante.com');
        }
    }

    /**
     * Validate user credentials
     */
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        // Remove password from returned user object
        const { password: _, ...result } = user;
        return result;
    }

    /**
     * Login user and generate JWT token
     */
    async login(loginDto: { email: string; password: string }) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const token = this.jwtService.sign(payload);

        // Return response in the exact format required by frontend
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
            },
        };
    }
}
