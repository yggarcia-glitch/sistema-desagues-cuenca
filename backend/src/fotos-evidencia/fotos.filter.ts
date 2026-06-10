import { BadRequestException } from '@nestjs/common';
import { Express } from 'express';

export const fotoFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: Function,
) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Solo se permiten archivos JPG y PNG'),
      false,
    );
  }
  callback(null, true);
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
