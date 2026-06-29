import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEventoDto {
  @IsInt()
  desagueId: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(20, { message: 'La descripcion debe tener al menos 20 caracteres' })
  @MaxLength(500, { message: 'La descripcion no puede superar los 500 caracteres' })
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 7 })
  latitud: number;

  @IsNumber({ maxDecimalPlaces: 7 })
  longitud: number;

  @IsIn(['alta', 'media', 'baja'], { message: 'La prioridad debe ser alta, media o baja' })
  prioridad: string;
}
