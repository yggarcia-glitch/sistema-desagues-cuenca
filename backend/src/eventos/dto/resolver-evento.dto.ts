import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Datos opcionales al marcar un evento como resuelto.
 * Si la alcantarilla no existe formalmente en la base (fue autogenerada al
 * reportar), el tecnico puede darle un codigo/id y un nombre para registrarla.
 * Por ahora ambos son opcionales.
 */
export class ResolverEventoDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  codigoDesague?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombreDesague?: string;
}
