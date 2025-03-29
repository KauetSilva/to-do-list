import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { CacheService } from '../cache/cache.service';

interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
}

interface UserWithoutPassword {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async createUser(createUserDto: { email: string; password: string; username: string }): Promise<any> {
    const existingUser = await this.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const saltOrRounds = 10;
    const passwordHash = await hash(createUserDto.password, saltOrRounds);
    
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        password: passwordHash,
      },
    });
    
    const { token } = await this.generateToken(user);
    return { ...user, token };
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    return this.cacheService.getCache<UserWithoutPassword[]>('users', () => 
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        },
      })
    );
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private async generateToken(user: User) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      jwtSecret,
      { expiresIn: '6h' },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}
