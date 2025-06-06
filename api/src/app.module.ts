import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { CacheModule } from './modules/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [UserModule, CacheModule, AuthModule, TaskModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
