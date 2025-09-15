import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../database/prisma.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PassportModule, CacheModule],
  controllers: [AuthController],
  providers: [JwtStrategy, UserService, PrismaService],
  exports: [PassportModule],
})
export class AuthModule {}
