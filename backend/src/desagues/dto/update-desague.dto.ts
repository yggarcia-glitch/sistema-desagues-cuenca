import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDesagueDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsIn(['sumidero', 'alcantarilla', 'cuneta'])
  tipoDesague?: string;

  @IsOptional()
  @IsInt()
  sectorId?: number;
}
