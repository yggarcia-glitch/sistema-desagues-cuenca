import { IsEnum } from 'class-validator';
import { EstadoEvento } from '@prisma/client';

export class UpdateEstadoDto {
  @IsEnum(EstadoEvento)
  estado: EstadoEvento;
}
