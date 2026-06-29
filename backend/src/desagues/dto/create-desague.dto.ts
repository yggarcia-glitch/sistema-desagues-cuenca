import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateDesagueDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsNumber({ maxDecimalPlaces: 7 })
  latitud: number;

  @IsNumber({ maxDecimalPlaces: 7 })
  longitud: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  direccion: string;

  @IsIn(['sumidero', 'alcantarilla', 'cuneta'], {
    message: 'El tipo de desague debe ser sumidero, alcantarilla o cuneta',
  })
  tipoDesague: string;

  @IsInt()
  sectorId: number;
}
