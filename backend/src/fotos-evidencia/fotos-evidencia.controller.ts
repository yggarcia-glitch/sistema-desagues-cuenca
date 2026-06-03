import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFotoDto } from './dto/create-foto.dto';
import { FotosEvidenciaService } from './fotos-evidencia.service';

@Controller('fotos-evidencia')
@UseGuards(JwtAuthGuard)
export class FotosEvidenciaController {
  constructor(private readonly fotosService: FotosEvidenciaService) {}

  @Post()
  create(@Body() dto: CreateFotoDto) {
    return this.fotosService.create(dto);
  }
}
