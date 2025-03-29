import { ApiProperty } from '@nestjs/swagger';

export class ResponseLoginUserDTO {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

};
  