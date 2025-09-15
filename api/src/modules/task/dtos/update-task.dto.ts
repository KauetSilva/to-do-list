import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class UpdateTaskDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Story points for the task (0-13)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(13)
  points?: number;

  @ApiProperty({
    required: false,
    description: 'Link to the task (Jira, GitHub, etc.)',
  })
  @IsOptional()
  @IsString()
  taskLink?: string;

  @ApiProperty({ required: false, enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({
    required: false,
    description: 'Sprint ID to assign the task to',
  })
  @IsOptional()
  @IsNumber()
  sprintId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({
    required: false,
    description: 'Estimated time in hours',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;
}
