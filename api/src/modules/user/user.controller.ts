import { Body, Controller, Get, Param, ParseIntPipe, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from './dtos/createUser.dto';
import { ResponseCreateUserDTO } from './dtos/responseCreateUser.dto';
import { ResponseGetAllUserDTO } from './dtos/responseGetAllUser.dto';
import { GetAllUserDTO } from './dtos/getAllUser.dto';
import { LoginUserDTO } from './dtos/loginUser.dto';
import { ResponseLoginUserDTO } from './dtos/responseLogin.dto';

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

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @UsePipes(ValidationPipe)
  @Post()
  @ApiResponse({ type: ResponseCreateUserDTO, description: 'user' })
  @ApiBody({ type: CreateUserDTO })
  async createUser(@Body() createUser: CreateUserDTO): Promise<any> {
    return this.userService.createUser(createUser);
  }

  @Get()
  @ApiResponse({ type: ResponseGetAllUserDTO, description: 'user' })
  @ApiBody({ type: GetAllUserDTO })
  async getAllUser(): Promise<UserWithoutPassword[]> {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiResponse({ type: CreateUserDTO, description: 'user' })
  @ApiParam({ name: 'id', example: '1' })
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return await this.userService.getUserById(id);
  }

  @Post('login')
  @ApiResponse({ type: ResponseLoginUserDTO, description: 'user' })
  @ApiBody({ type: LoginUserDTO })
  async login(@Body() loginDto: LoginUserDTO): Promise<User | null> {
    const { email, password } = loginDto;
    return await this.userService.login(email, password);
  }
}
