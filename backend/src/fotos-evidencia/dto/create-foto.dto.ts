import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateFotoDto {
  @IsInt({ message: 'eventoId debe ser un numero entero' })
  @IsNotEmpty({ message: 'eventoId es obligatorio' })
  eventoId: number;
}
