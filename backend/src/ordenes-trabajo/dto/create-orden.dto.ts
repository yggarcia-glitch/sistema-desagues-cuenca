import { IsInt, IsPositive } from 'class-validator';

export class CreateOrdenDto {
  @IsInt()
  @IsPositive()
  eventoId: number;

  @IsInt()
  @IsPositive()
  tecnicoId: number;
}
