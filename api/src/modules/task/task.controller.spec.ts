import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { NotFoundException } from '@nestjs/common';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockTaskService = {
    createTask: jest.fn(),
    getTasks: jest.fn(),
    updateTask: jest.fn(),
    toggleTaskCompletion: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        userId: 1,
        createdAt: new Date(),
      };

      const mockRequest = {
        user: { id: 1 },
      };

      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      mockTaskService.createTask.mockResolvedValue(mockTask);

      const result = await controller.createTask(mockRequest, createTaskDto);
      expect(result).toEqual(mockTask);
      expect(service.createTask).toHaveBeenCalledWith(1, createTaskDto);
    });
  });

  describe('getTasks', () => {
    it('should get tasks with pagination', async () => {
      const mockTasks = {
        tasks: [
          {
            id: 1,
            title: 'Test Task',
            description: 'Test Description',
            completed: false,
            userId: 1,
            createdAt: new Date(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
        },
      };

      const mockRequest = {
        user: { id: 1 },
      };

      mockTaskService.getTasks.mockResolvedValue(mockTasks);

      const result = await controller.getTasks(mockRequest, 1, 10);
      expect(result).toEqual(mockTasks);
      expect(service.getTasks).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('updateTask', () => {
    it('should handle task not found', async () => {
      const mockRequest = { user: { id: 1 } };
      const updateDto = { title: 'Updated Task' };

      mockTaskService.updateTask.mockRejectedValue(new NotFoundException());

      await expect(
        controller.updateTask(mockRequest, 999, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should handle task not found', async () => {
      const mockRequest = { user: { id: 1 } };

      mockTaskService.toggleTaskCompletion.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.toggleTaskCompletion(mockRequest, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('should handle task not found', async () => {
      const mockRequest = { user: { id: 1 } };

      mockTaskService.deleteTask.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteTask(mockRequest, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
