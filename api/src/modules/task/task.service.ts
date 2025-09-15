import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDTO } from './dtos/create-task.dto';
import { UpdateTaskDTO } from './dtos/update-task.dto';
import { CreateNoteDTO } from './dtos/create-note.dto';
import { UpdateNoteDTO } from './dtos/update-note.dto';
import { CreateTimeEntryDTO } from './dtos/create-time-entry.dto';
import { UpdateTimeEntryDTO } from './dtos/update-time-entry.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(userId: number, createTaskDto: CreateTaskDTO) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
      },
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
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
        include: {
          sprint: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
          },
          timeEntries: {
            orderBy: { createdAt: 'desc' },
          },
        },
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

  async getTasksBySprint(userId: number, sprintId: number) {
    return this.prisma.task.findMany({
      where: {
        userId,
        sprintId,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
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

    const updateData: any = { ...updateTaskDto };

    // Se a tarefa foi marcada como completa, adicionar timestamp
    if (updateTaskDto.completed && !task.completed) {
      updateData.completedAt = new Date();
    }

    // Se a tarefa foi desmarcada como completa, remover timestamp
    if (updateTaskDto.completed === false && task.completed) {
      updateData.completedAt = null;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  async toggleTaskCompletion(taskId: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updateData: any = { completed: !task.completed };

    if (!task.completed) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
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

  async getDailyReport(userId: number, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [completedTasks, totalPoints, sprintTasks] = await Promise.all([
      // Tarefas completadas no dia
      this.prisma.task.findMany({
        where: {
          userId,
          completed: true,
          completedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          sprint: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      }),

      // Total de pontos completados no dia
      this.prisma.task.aggregate({
        where: {
          userId,
          completed: true,
          completedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        _sum: {
          points: true,
        },
      }),

      // Tarefas da sprint ativa
      this.prisma.task.findMany({
        where: {
          userId,
          sprint: {
            status: 'ACTIVE',
          },
        },
        include: {
          sprint: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { priority: 'desc' },
      }),
    ]);

    const pendingTasks = sprintTasks.filter((task) => !task.completed);
    const totalSprintPoints = sprintTasks.reduce(
      (sum, task) => sum + task.points,
      0,
    );
    const completedSprintPoints = sprintTasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + task.points, 0);

    return {
      date: targetDate.toISOString().split('T')[0],
      summary: {
        completedTasks: completedTasks.length,
        completedPoints: totalPoints._sum.points || 0,
        pendingTasks: pendingTasks.length,
        pendingPoints: totalSprintPoints - completedSprintPoints,
      },
      completedTasks: completedTasks.map((task) => ({
        id: task.id,
        title: task.title,
        points: task.points,
        completedAt: task.completedAt,
        sprint: task.sprint?.name || 'Sem Sprint',
        taskLink: task.taskLink,
      })),
      pendingTasks: pendingTasks.map((task) => ({
        id: task.id,
        title: task.title,
        points: task.points,
        priority: task.priority,
        sprint: task.sprint?.name || 'Sem Sprint',
        taskLink: task.taskLink,
      })),
      sprintProgress: {
        totalTasks: sprintTasks.length,
        completedTasks: sprintTasks.filter((task) => task.completed).length,
        totalPoints: totalSprintPoints,
        completedPoints: completedSprintPoints,
        completionRate:
          sprintTasks.length > 0
            ? (sprintTasks.filter((task) => task.completed).length /
                sprintTasks.length) *
              100
            : 0,
      },
    };
  }

  async getSprintTasks(userId: number, sprintId: number) {
    return this.prisma.task.findMany({
      where: {
        userId,
        sprintId,
      },
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  // ====== NOTES METHODS ======
  async createNote(
    taskId: number,
    userId: number,
    createNoteDto: CreateNoteDTO,
  ) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.taskNote.create({
      data: {
        ...createNoteDto,
        taskId,
        userId,
      },
    });
  }

  async getNotes(taskId: number, userId: number) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.taskNote.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateNote(
    noteId: number,
    taskId: number,
    userId: number,
    updateNoteDto: UpdateNoteDTO,
  ) {
    // Verificar se a nota existe e pertence ao usuário
    const note = await this.prisma.taskNote.findFirst({
      where: { id: noteId, taskId, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.taskNote.update({
      where: { id: noteId },
      data: updateNoteDto,
    });
  }

  async deleteNote(noteId: number, taskId: number, userId: number) {
    // Verificar se a nota existe e pertence ao usuário
    const note = await this.prisma.taskNote.findFirst({
      where: { id: noteId, taskId, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.taskNote.delete({
      where: { id: noteId },
    });

    return { message: 'Note deleted successfully' };
  }

  // ====== TIME ENTRIES METHODS ======
  async createTimeEntry(
    taskId: number,
    userId: number,
    createTimeEntryDto: CreateTimeEntryDTO,
  ) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        ...createTimeEntryDto,
        taskId,
        userId,
        startTime: createTimeEntryDto.startTime
          ? new Date(createTimeEntryDto.startTime)
          : null,
        endTime: createTimeEntryDto.endTime
          ? new Date(createTimeEntryDto.endTime)
          : null,
      },
    });

    // Atualizar o tempo total gasto na tarefa
    await this.updateTaskTimeSpent(taskId);

    return timeEntry;
  }

  async getTimeEntries(taskId: number, userId: number) {
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.timeEntry.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTimeEntry(
    entryId: number,
    taskId: number,
    userId: number,
    updateTimeEntryDto: UpdateTimeEntryDTO,
  ) {
    // Verificar se a entrada de tempo existe e pertence ao usuário
    const timeEntry = await this.prisma.timeEntry.findFirst({
      where: { id: entryId, taskId, userId },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    const updateData: any = { ...updateTimeEntryDto };
    if (updateTimeEntryDto.startTime) {
      updateData.startTime = new Date(updateTimeEntryDto.startTime);
    }
    if (updateTimeEntryDto.endTime) {
      updateData.endTime = new Date(updateTimeEntryDto.endTime);
    }

    const updatedEntry = await this.prisma.timeEntry.update({
      where: { id: entryId },
      data: updateData,
    });

    // Atualizar o tempo total gasto na tarefa
    await this.updateTaskTimeSpent(taskId);

    return updatedEntry;
  }

  async deleteTimeEntry(entryId: number, taskId: number, userId: number) {
    // Verificar se a entrada de tempo existe e pertence ao usuário
    const timeEntry = await this.prisma.timeEntry.findFirst({
      where: { id: entryId, taskId, userId },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    await this.prisma.timeEntry.delete({
      where: { id: entryId },
    });

    // Atualizar o tempo total gasto na tarefa
    await this.updateTaskTimeSpent(taskId);

    return { message: 'Time entry deleted successfully' };
  }

  private async updateTaskTimeSpent(taskId: number) {
    const totalTime = await this.prisma.timeEntry.aggregate({
      where: { taskId },
      _sum: {
        hours: true,
      },
    });

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        timeSpent: totalTime._sum.hours || 0,
      },
    });
  }

  async getTaskWithDetails(taskId: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        sprint: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}
