import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerFotoConfig } from '../common/upload.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateFotoDto } from './dto/create-foto.dto';
import { FotosEvidenciaService } from './fotos-evidencia.service';

@Controller('fotos-evidencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FotosEvidenciaController {
  constructor(private readonly fotosService: FotosEvidenciaService) {}

  @Post()
  @Roles('ciudadano', 'tecnico', 'admin')
  @UseInterceptors(FileInterceptor('foto', multerFotoConfig))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateFotoDto,
  ) {
    if (!file) throw new BadRequestException('La foto es obligatoria');
    return this.fotosService.create(dto.eventoId, `uploads/${file.filename}`);
  }

  @Get()
  @Roles('tecnico', 'admin')
  findAll() {
    return this.fotosService.findAll();
  }

  @Get(':id')
  @Roles('tecnico', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.findOne(id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.remove(id);
  }
}
