import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../..//database/prisma.service';
import { CacheModule } from '../cache/cache.module';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [CacheModule], 
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
