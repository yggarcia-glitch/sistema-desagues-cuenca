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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateFotoDto } from './dto/create-foto.dto';
import { FotosEvidenciaService } from './fotos-evidencia.service';

const UPLOADS_DIR = join(__dirname, '..', '..', '..', 'uploads');

const multerConfig = {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      cb(null, `foto-${Date.now()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Solo se aceptan jpg, jpeg, png, webp'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

@Controller('fotos-evidencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FotosEvidenciaController {
  constructor(private readonly fotosService: FotosEvidenciaService) {}

  @Post()
  @Roles('ciudadano')
  @UseInterceptors(FileInterceptor('foto', multerConfig))
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
