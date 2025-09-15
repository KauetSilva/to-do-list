import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNoteDTO {
  @ApiProperty({
    required: false,
    description: 'Content of the note',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}

