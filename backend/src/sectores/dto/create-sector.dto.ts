import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSectorDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
