import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDTO } from './dtos/create-task.dto';
import { UpdateTaskDTO } from './dtos/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async createTask(@Request() req, @Body() createTaskDto: CreateTaskDTO) {
    return this.taskService.createTask(req.user.id, createTaskDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all tasks' })
  async getTasks(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.taskService.getTasks(req.user.id, page, limit);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  async updateTask(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDTO,
  ) {
    return this.taskService.updateTask(id, req.user.id, updateTaskDto);
  }

  @Put(':id/toggle')
  @ApiResponse({
    status: 200,
    description: 'Task completion toggled successfully',
  })
  async toggleTaskCompletion(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.toggleTaskCompletion(id, req.user.id);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  async deleteTask(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.taskService.deleteTask(id, req.user.id);
  }
}
