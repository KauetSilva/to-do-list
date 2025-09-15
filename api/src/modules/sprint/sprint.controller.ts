import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SprintService } from './sprint.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('sprints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sprints')
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sprint' })
  @ApiResponse({ status: 201, description: 'Sprint created successfully' })
  create(@Body() createSprintDto: CreateSprintDto, @Request() req) {
    return this.sprintService.create(createSprintDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sprints for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Sprints retrieved successfully' })
  findAll(@Request() req) {
    return this.sprintService.findAll(req.user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active sprint' })
  @ApiResponse({
    status: 200,
    description: 'Active sprint retrieved successfully',
  })
  getActiveSprint(@Request() req) {
    return this.sprintService.getActiveSprint(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific sprint by ID' })
  @ApiResponse({ status: 200, description: 'Sprint retrieved successfully' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.sprintService.findOne(+id, req.user.id);
  }

  @Get(':id/metrics')
  @ApiOperation({ summary: 'Get sprint metrics and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Sprint metrics retrieved successfully',
  })
  getSprintMetrics(@Param('id') id: string, @Request() req) {
    return this.sprintService.getSprintMetrics(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sprint' })
  @ApiResponse({ status: 200, description: 'Sprint updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateSprintDto: UpdateSprintDto,
    @Request() req,
  ) {
    return this.sprintService.update(+id, updateSprintDto, req.user.id);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate a sprint (deactivates current active sprint)',
  })
  @ApiResponse({ status: 200, description: 'Sprint activated successfully' })
  activateSprint(@Param('id') id: string, @Request() req) {
    return this.sprintService.activateSprint(+id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sprint' })
  @ApiResponse({ status: 200, description: 'Sprint deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.sprintService.remove(+id, req.user.id);
  }
}
