import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../cache/cache.service';
import { UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcrypt';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCacheService = {
    getCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    it('should create a new user', async () => {
      const hashedPassword = await hash(createUserDto.password, 10);
      const mockUser = {
        id: 1,
        ...createUserDto,
        password: hashedPassword,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

      const result = await service.createUser(createUserDto);

      expect(result).toHaveProperty('token');
      expect(result.email).toBe(createUserDto.email);
      expect(result.username).toBe(createUserDto.username);
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: 1 });

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return token when credentials are valid', async () => {
      const hashedPassword = await hash(loginDto.password, 10);
      const mockUser = {
        id: 1,
        email: loginDto.email,
        password: hashedPassword,
        username: 'testuser',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.login(loginDto.email, loginDto.password);

      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('id', mockUser.id);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.login(loginDto.email, loginDto.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const hashedPassword = await hash('differentpassword', 10);
      const mockUser = {
        id: 1,
        email: loginDto.email,
        password: hashedPassword,
        username: 'testuser',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(
        service.login(loginDto.email, loginDto.password),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAllUsers', () => {
    it('should return users from cache when available', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          createdAt: new Date(),
        },
      ];

      mockCacheService.getCache.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users from database when not in cache', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          createdAt: new Date(),
        },
      ];

      mockCacheService.getCache.mockImplementation((key, fn) => fn());
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById(999);
      expect(result).toBeNull();
    });
  });
});
