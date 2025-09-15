import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNoteDTO {
  @ApiProperty({
    description: 'Content of the note',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

