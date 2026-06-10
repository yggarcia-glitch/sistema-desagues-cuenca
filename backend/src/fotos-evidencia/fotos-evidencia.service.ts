import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FotosEvidenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { eventoId: number; urlImagen: string }) {
    // Verificar que el evento existe
    const evento = await this.prisma.evento.findUnique({
      where: { id: data.eventoId },
    });
    if (!evento) {
      throw new NotFoundException(`Evento #${data.eventoId} no encontrado`);
    }

    // Verificar maximo 3 fotos por evento
    const totalFotos = await this.prisma.fotoEvidencia.count({
      where: { eventoId: data.eventoId },
    });
    if (totalFotos >= 3) {
      throw new BadRequestException(
        'El EVENTO ya tiene el maximo de 3 fotos permitidas',
      );
    }

    return this.prisma.fotoEvidencia.create({
      data: {
        eventoId: data.eventoId,
        urlImagen: data.urlImagen,
      },
    });
  }
}
