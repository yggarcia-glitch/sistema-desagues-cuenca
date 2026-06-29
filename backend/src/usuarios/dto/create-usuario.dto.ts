import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(80)
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  @MaxLength(80)
  apellido: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Debe ingresar un correo valido' })
  @MaxLength(120)
  correo: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una mayuscula' })
  @Matches(/[0-9]/, { message: 'Debe contener al menos un numero' })
  contrasena: string;

  @IsIn(['tecnico', 'admin'], { message: 'El rol debe ser tecnico o admin' })
  tipoUsuario: string;
}
