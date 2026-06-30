import { IsIn, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEventoDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(20, { message: 'La descripcion debe tener al menos 20 caracteres' })
  @MaxLength(500, { message: 'La descripcion no puede superar los 500 caracteres' })
  descripcion: string;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsIn(['alta', 'media', 'baja'], { message: 'La prioridad debe ser alta, media o baja' })
  prioridad: string;
}
