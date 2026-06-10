import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FotosEvidenciaService } from './fotos-evidencia.service';
import { fotoFileFilter, MAX_FILE_SIZE } from './fotos.filter';

@Controller('fotos-evidencia')
@UseGuards(JwtAuthGuard)
export class FotosEvidenciaController {
  constructor(private readonly fotosService: FotosEvidenciaService) {}

  // POST /fotos-evidencia — US-03: Subida de foto de evidencia
  @Post()
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/fotos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `foto-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: fotoFileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async subirFoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('eventoId', ParseIntPipe) eventoId: number,
  ) {
    if (!file) {
      throw new BadRequestException('Debes subir una foto (campo: foto)');
    }
    const urlImagen = `uploads/fotos/${file.filename}`;
    return this.fotosService.create({ eventoId, urlImagen });
  }
}
