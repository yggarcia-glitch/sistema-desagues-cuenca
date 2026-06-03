import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFotoDto } from './dto/create-foto.dto';

@Injectable()
export class FotosEvidenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFotoDto) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: dto.eventoId },
    });
    if (!evento) throw new NotFoundException(`Evento #${dto.eventoId} no encontrado`);

    return this.prisma.fotoEvidencia.create({
      data: {
        eventoId: dto.eventoId,
        urlImagen: dto.urlImagen,
      },
    });
  }
}
