import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { CacheModule } from './modules/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UserModule, CacheModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
