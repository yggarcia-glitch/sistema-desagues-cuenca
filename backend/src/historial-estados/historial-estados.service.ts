import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const INCLUDE_HISTORIAL = {
  evento: { select: { id: true, descripcion: true } },
  estadoAnterior: { select: { id: true, nombre: true } },
  estadoNuevo: { select: { id: true, nombre: true } },
  usuario: { select: { id: true, nombre: true, apellido: true } },
};

@Injectable()
export class HistorialEstadosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.historialEstado.findMany({
      include: INCLUDE_HISTORIAL,
      orderBy: { fechaCambio: 'desc' },
    });
  }

  async findOne(id: number) {
    const registro = await this.prisma.historialEstado.findUnique({
      where: { id },
      include: INCLUDE_HISTORIAL,
    });
    if (!registro) throw new NotFoundException(`Registro de historial #${id} no encontrado`);
    return registro;
  }

  findByEvento(eventoId: number) {
    return this.prisma.historialEstado.findMany({
      where: { eventoId },
      include: {
        estadoAnterior: { select: { nombre: true } },
        estadoNuevo: { select: { nombre: true } },
        usuario: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { fechaCambio: 'desc' },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.historialEstado.delete({ where: { id } });
    return { mensaje: `Registro de historial #${id} eliminado` };
  }
}
