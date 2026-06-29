import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @IsOptional()
  @IsIn(['ciudadano', 'tecnico', 'admin'])
  tipoUsuario?: string;
}
