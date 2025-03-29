import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);
      expect(result).toEqual(mockUser);
      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        token: 'jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
        },
      };

      mockUserService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);
      expect(result).toEqual(mockResponse);
      expect(service.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });
});
