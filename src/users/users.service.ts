import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Find a user by email (includes password for authentication)
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'fullName', 'role'],
        });
    }

    /**
     * Create a new user with hashed password
     */
    async create(userData: {
        email: string;
        password: string;
        fullName: string;
        role: UserRole;
    }): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
        });

        return this.userRepository.save(user);
    }

    /**
     * Count total users in database
     */
    async count(): Promise<number> {
        return this.userRepository.count();
    }
}
