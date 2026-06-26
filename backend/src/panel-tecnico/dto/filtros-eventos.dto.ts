import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoEvento, Prioridad } from '@prisma/client';

export class FiltrosEventosDto {
  @IsOptional()
  @IsEnum(EstadoEvento)
  estado?: EstadoEvento;

  @IsOptional()
  @IsEnum(Prioridad)
  prioridad?: Prioridad;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sectorId?: number;
}
