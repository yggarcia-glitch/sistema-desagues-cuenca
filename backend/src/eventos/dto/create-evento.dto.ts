import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripcion no puede superar los 500 caracteres' })
  descripcion?: string;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsIn(['alta', 'media', 'baja'], { message: 'La prioridad debe ser alta, media o baja' })
  prioridad: string;
}
