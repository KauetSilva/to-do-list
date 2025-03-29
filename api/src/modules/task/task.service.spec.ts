import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    const createTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
    };
    const userId = 1;

    it('should create a new task', async () => {
      const mockTask = {
        id: 1,
        ...createTaskDto,
        userId,
        completed: false,
        createdAt: new Date(),
      };

      mockPrismaService.task.create.mockResolvedValueOnce(mockTask);

      const result = await service.createTask(userId, createTaskDto);

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          ...createTaskDto,
          userId,
        },
      });
    });
  });

  describe('getTasks', () => {
    const userId = 1;
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        completed: false,
        userId: 1,
        createdAt: new Date(),
      },
    ];

    it('should return tasks with pagination', async () => {
      mockPrismaService.task.findMany.mockResolvedValueOnce(mockTasks);
      mockPrismaService.task.count.mockResolvedValueOnce(1);

      const result = await service.getTasks(userId, 1, 10);

      expect(result.tasks).toEqual(mockTasks);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        lastPage: 1,
      });
    });
  });

  describe('updateTask', () => {
    const taskId = 1;
    const userId = 1;
    const updateTaskDto = {
      title: 'Updated Task',
    };

    it('should update a task', async () => {
      const mockTask = {
        id: taskId,
        title: 'Old Title',
        description: 'Description',
        completed: false,
        userId,
        createdAt: new Date(),
      };

      mockPrismaService.task.findFirst.mockResolvedValueOnce(mockTask);
      mockPrismaService.task.update.mockResolvedValueOnce({
        ...mockTask,
        ...updateTaskDto,
      });

      const result = await service.updateTask(taskId, userId, updateTaskDto);

      expect(result.title).toBe(updateTaskDto.title);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.updateTask(taskId, userId, updateTaskDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleTaskCompletion', () => {
    const taskId = 1;
    const userId = 1;

    it('should toggle task completion status', async () => {
      const mockTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        completed: false,
        userId,
        createdAt: new Date(),
      };

      mockPrismaService.task.findFirst.mockResolvedValueOnce(mockTask);
      mockPrismaService.task.update.mockResolvedValueOnce({
        ...mockTask,
        completed: true,
      });

      const result = await service.toggleTaskCompletion(taskId, userId);

      expect(result.completed).toBe(true);
    });
  });

  describe('deleteTask', () => {
    const taskId = 1;
    const userId = 1;

    it('should delete a task', async () => {
      const mockTask = {
        id: taskId,
        title: 'Task',
        description: 'Description',
        completed: false,
        userId,
        createdAt: new Date(),
      };

      mockPrismaService.task.findFirst.mockResolvedValueOnce(mockTask);
      mockPrismaService.task.delete.mockResolvedValueOnce(mockTask);

      const result = await service.deleteTask(taskId, userId);

      expect(result).toEqual({ message: 'Task deleted successfully' });
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValueOnce(null);

      await expect(service.deleteTask(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
