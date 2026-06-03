import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventoDto) {
    return this.prisma.evento.create({
      data: {
        usuarioId: dto.usuarioId,
        desagueId: dto.desagueId,
        descripcion: dto.descripcion,
        latitud: dto.latitud,
        longitud: dto.longitud,
        prioridad: dto.prioridad,
      },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
        desague: { select: { id: true, codigo: true, direccion: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.evento.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
        desague: { select: { id: true, codigo: true, direccion: true } },
        fotos: true,
      },
      orderBy: { fechaEvento: 'desc' },
    });
  }

  async findOne(id: number) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
        desague: { select: { id: true, codigo: true, direccion: true } },
        fotos: true,
        historial: { orderBy: { fechaCambio: 'desc' } },
      },
    });
    if (!evento) throw new NotFoundException(`Evento #${id} no encontrado`);
    return evento;
  }

  async updateEstado(id: number, dto: UpdateEstadoDto, usuarioId: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException(`Evento #${id} no encontrado`);

    return this.prisma.$transaction(async (tx) => {
      const eventoActualizado = await tx.evento.update({
        where: { id },
        data: { estado: dto.estado },
      });

      await tx.historialEstado.create({
        data: {
          eventoId: id,
          estadoAnterior: evento.estado,
          estadoNuevo: dto.estado,
          usuarioId,
        },
      });

      return eventoActualizado;
    });
  }
}
