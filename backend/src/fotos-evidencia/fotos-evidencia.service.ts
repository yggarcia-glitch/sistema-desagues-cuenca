import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FotosEvidenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventoId: number, filePath: string) {
    const evento = await this.prisma.evento.findUnique({ where: { id: eventoId } });
    if (!evento) {
      await unlink(filePath).catch(() => null);
      throw new NotFoundException(`Evento #${eventoId} no encontrado`);
    }

    const count = await this.prisma.fotoEvidencia.count({ where: { eventoId } });
    if (count >= 3) {
      await unlink(filePath).catch(() => null);
      throw new BadRequestException('El reporte ya tiene el maximo de 3 fotos');
    }

    return this.prisma.fotoEvidencia.create({
      data: { eventoId, urlImagen: filePath },
    });
  }

  findAll() {
    return this.prisma.fotoEvidencia.findMany({
      include: { evento: { select: { id: true, descripcion: true } } },
      orderBy: { fechaCaptura: 'desc' },
    });
  }

  async findOne(id: number) {
    const foto = await this.prisma.fotoEvidencia.findUnique({
      where: { id },
      include: { evento: { select: { id: true, descripcion: true } } },
    });
    if (!foto) throw new NotFoundException(`Foto #${id} no encontrada`);
    return foto;
  }

  async remove(id: number) {
    const foto = await this.prisma.fotoEvidencia.findUnique({ where: { id } });
    if (!foto) throw new NotFoundException(`Foto #${id} no encontrada`);

    await this.prisma.fotoEvidencia.delete({ where: { id } });
    await unlink(foto.urlImagen).catch(() => null);

    return { mensaje: `Foto #${id} eliminada` };
  }
}
