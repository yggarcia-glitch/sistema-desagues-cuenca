import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrosEventosDto {
  @IsOptional()
  @IsIn(['pendiente', 'en_proceso', 'resuelto'])
  estado?: string;

  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  prioridad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sectorId?: number;
}
