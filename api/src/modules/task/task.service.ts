import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDTO } from './dtos/create-task.dto';
import { UpdateTaskDTO } from './dtos/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(userId: number, createTaskDto: CreateTaskDTO) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
      },
    });
  }

  async getTasks(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where: { userId } }),
    ]);

    return {
      tasks,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async updateTask(
    taskId: number,
    userId: number,
    updateTaskDto: UpdateTaskDTO,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateTaskDto,
    });
  }

  async toggleTaskCompletion(taskId: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { completed: !task.completed },
    });
  }

  async deleteTask(taskId: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }
}
