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
import { CreateNoteDTO } from './dtos/create-note.dto';
import { UpdateNoteDTO } from './dtos/update-note.dto';
import { CreateTimeEntryDTO } from './dtos/create-time-entry.dto';
import { UpdateTimeEntryDTO } from './dtos/update-time-entry.dto';
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

  @Get('daily-report')
  @ApiResponse({
    status: 200,
    description: 'Daily report retrieved successfully',
  })
  async getDailyReport(@Request() req, @Query('date') date?: string) {
    return this.taskService.getDailyReport(req.user.id, date);
  }

  @Get(':id/details')
  @ApiResponse({
    status: 200,
    description: 'Task with notes and time entries retrieved successfully',
  })
  async getTaskWithDetails(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.getTaskWithDetails(id, req.user.id);
  }

  // ====== NOTES ENDPOINTS ======
  @Post(':id/notes')
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  async createNote(
    @Request() req,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() createNoteDto: CreateNoteDTO,
  ) {
    return this.taskService.createNote(taskId, req.user.id, createNoteDto);
  }

  @Get(':id/notes')
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async getNotes(@Request() req, @Param('id', ParseIntPipe) taskId: number) {
    return this.taskService.getNotes(taskId, req.user.id);
  }

  @Put(':id/notes/:noteId')
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  async updateNote(
    @Request() req,
    @Param('id', ParseIntPipe) taskId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() updateNoteDto: UpdateNoteDTO,
  ) {
    return this.taskService.updateNote(
      noteId,
      taskId,
      req.user.id,
      updateNoteDto,
    );
  }

  @Delete(':id/notes/:noteId')
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  async deleteNote(
    @Request() req,
    @Param('id', ParseIntPipe) taskId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ) {
    return this.taskService.deleteNote(noteId, taskId, req.user.id);
  }

  // ====== TIME ENTRIES ENDPOINTS ======
  @Post(':id/time-entries')
  @ApiResponse({ status: 201, description: 'Time entry created successfully' })
  async createTimeEntry(
    @Request() req,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() createTimeEntryDto: CreateTimeEntryDTO,
  ) {
    return this.taskService.createTimeEntry(
      taskId,
      req.user.id,
      createTimeEntryDto,
    );
  }

  @Get(':id/time-entries')
  @ApiResponse({
    status: 200,
    description: 'Time entries retrieved successfully',
  })
  async getTimeEntries(
    @Request() req,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getTimeEntries(taskId, req.user.id);
  }

  @Put(':id/time-entries/:entryId')
  @ApiResponse({ status: 200, description: 'Time entry updated successfully' })
  async updateTimeEntry(
    @Request() req,
    @Param('id', ParseIntPipe) taskId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body() updateTimeEntryDto: UpdateTimeEntryDTO,
  ) {
    return this.taskService.updateTimeEntry(
      entryId,
      taskId,
      req.user.id,
      updateTimeEntryDto,
    );
  }

  @Delete(':id/time-entries/:entryId')
  @ApiResponse({ status: 200, description: 'Time entry deleted successfully' })
  async deleteTimeEntry(
    @Request() req,
    @Param('id', ParseIntPipe) taskId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
  ) {
    return this.taskService.deleteTimeEntry(entryId, taskId, req.user.id);
  }
}
