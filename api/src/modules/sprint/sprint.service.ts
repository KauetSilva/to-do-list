import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { SprintStatus } from '@prisma/client';

@Injectable()
export class SprintService {
  constructor(private prisma: PrismaService) {}

  async create(createSprintDto: CreateSprintDto, userId: number) {
    return this.prisma.sprint.create({
      data: {
        ...createSprintDto,
        userId,
        startDate: new Date(createSprintDto.startDate),
        endDate: new Date(createSprintDto.endDate),
      },
      include: {
        tasks: true,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.sprint.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            completed: true,
            points: true,
            priority: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const sprint = await this.prisma.sprint.findFirst({
      where: { id, userId },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    return sprint;
  }

  async update(id: number, updateSprintDto: UpdateSprintDto, userId: number) {
    await this.findOne(id, userId);

    const updateData: any = { ...updateSprintDto };
    if (updateSprintDto.startDate) {
      updateData.startDate = new Date(updateSprintDto.startDate);
    }
    if (updateSprintDto.endDate) {
      updateData.endDate = new Date(updateSprintDto.endDate);
    }

    return this.prisma.sprint.update({
      where: { id },
      data: updateData,
      include: {
        tasks: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.sprint.delete({
      where: { id },
    });
  }

  async getActiveSprint(userId: number) {
    return this.prisma.sprint.findFirst({
      where: {
        userId,
        status: SprintStatus.ACTIVE,
      },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async activateSprint(id: number, userId: number) {
    // Desativar sprint ativo atual
    await this.prisma.sprint.updateMany({
      where: {
        userId,
        status: SprintStatus.ACTIVE,
      },
      data: {
        status: SprintStatus.COMPLETED,
      },
    });

    // Ativar nova sprint
    return this.prisma.sprint.update({
      where: { id },
      data: {
        status: SprintStatus.ACTIVE,
      },
      include: {
        tasks: true,
      },
    });
  }

  async getSprintMetrics(id: number, userId: number) {
    const sprint = await this.findOne(id, userId);

    const totalTasks = sprint.tasks.length;
    const completedTasks = sprint.tasks.filter((task) => task.completed).length;
    const totalPoints = sprint.tasks.reduce(
      (sum, task) => sum + task.points,
      0,
    );
    const completedPoints = sprint.tasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + task.points, 0);

    return {
      sprint,
      metrics: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        completionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        totalPoints,
        completedPoints,
        pendingPoints: totalPoints - completedPoints,
        pointsCompletionRate:
          totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0,
      },
    };
  }
}
