import { ApiProperty } from '@nestjs/swagger';

export class RecognizeIngredientsDto {
  @ApiProperty()
  image: string;
}
