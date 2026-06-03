import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Debe ingresar un correo valido' })
  correo: string;

  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  @IsString()
  contrasena: string;
}
