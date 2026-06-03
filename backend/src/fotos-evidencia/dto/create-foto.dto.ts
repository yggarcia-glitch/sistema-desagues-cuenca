import { IsInt, IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateFotoDto {
  @IsInt()
  eventoId: number;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  urlImagen: string;
}
