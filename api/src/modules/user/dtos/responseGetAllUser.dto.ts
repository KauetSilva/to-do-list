import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetAllUserDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
  
  @ApiProperty()
  createdAt: string;
};
  