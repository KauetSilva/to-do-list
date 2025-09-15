import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateTimeEntryDTO {
  @ApiProperty({
    description: 'Description of the work done',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Hours worked',
  })
  @IsNumber()
  @Min(0)
  hours: number;

  @ApiProperty({
    description: 'Start time of the work session',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    description: 'End time of the work session',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

