import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Prioridad } from '@prisma/client';

export class CreateEventoDto {
  @IsInt()
  usuarioId: number;

  @IsInt()
  desagueId: number;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 7 })
  latitud: number;

  @IsNumber({ maxDecimalPlaces: 7 })
  longitud: number;

  @IsEnum(Prioridad)
  prioridad: Prioridad;
}
