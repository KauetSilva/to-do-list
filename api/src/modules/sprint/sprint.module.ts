import { Module } from '@nestjs/common';
import { SprintController } from './sprint.controller';
import { SprintService } from './sprint.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SprintController],
  providers: [SprintService, PrismaService],
  exports: [SprintService],
})
export class SprintModule {}
