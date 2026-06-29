import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateOrdenDto {
  @IsOptional()
  @IsIn(['resuelto', 'parcial', 'sin_solucion'], {
    message: 'El resultado debe ser resuelto, parcial o sin_solucion',
  })
  resultado?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  fechaIntervencion?: string;
}
