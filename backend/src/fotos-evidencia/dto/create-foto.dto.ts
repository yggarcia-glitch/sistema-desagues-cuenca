import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class CreateFotoDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  eventoId: number;
}
