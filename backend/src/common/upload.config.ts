import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

// backend/dist/src/common -> backend/uploads (3 niveles arriba)
export const UPLOADS_DIR = join(__dirname, '..', '..', '..', 'uploads');

/** Config de Multer compartida para subir fotos de evidencia (jpg/png/webp, 5MB). */
export const multerFotoConfig = {
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
