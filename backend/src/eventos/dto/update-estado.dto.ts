import { IsIn } from 'class-validator';

export class UpdateEstadoDto {
  @IsIn(['pendiente', 'en_proceso', 'resuelto'], {
    message: 'El estado debe ser pendiente, en_proceso o resuelto',
  })
  estado: string;
}
