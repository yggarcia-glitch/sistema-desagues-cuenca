import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

const INCLUDE_EVENTO = {
  usuario: { select: { id: true, nombre: true, apellido: true } },
  desague: { select: { id: true, codigo: true, direccion: true } },
  prioridad: { select: { id: true, nombre: true } },
  estado: { select: { id: true, nombre: true } },
};

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventoDto, usuarioId: number) {
    const prioridad = await this.prisma.prioridad.findUnique({ where: { nombre: dto.prioridad } });
    if (!prioridad) throw new BadRequestException(`Prioridad '${dto.prioridad}' no existe`);

    const estadoPendiente = await this.prisma.estadoEvento.findUnique({ where: { nombre: 'pendiente' } });

    return this.prisma.evento.create({
      data: {
        usuarioId,
        desagueId: dto.desagueId,
        descripcion: dto.descripcion,
        latitud: dto.latitud,
        longitud: dto.longitud,
        prioridadId: prioridad.id,
        estadoId: estadoPendiente!.id,
      },
      include: INCLUDE_EVENTO,
    });
  }

  findAll() {
    return this.prisma.evento.findMany({
      include: { ...INCLUDE_EVENTO, fotos: true },
      orderBy: { fechaEvento: 'desc' },
    });
  }

  async findOne(id: number) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
      include: {
        ...INCLUDE_EVENTO,
        fotos: true,
        historial: {
          include: {
            estadoAnterior: { select: { nombre: true } },
            estadoNuevo: { select: { nombre: true } },
            usuario: { select: { id: true, nombre: true, apellido: true } },
          },
          orderBy: { fechaCambio: 'desc' },
        },
      },
    });
    if (!evento) throw new NotFoundException(`Evento #${id} no encontrado`);
    return evento;
  }

  async updateEstado(id: number, dto: UpdateEstadoDto, usuarioId: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException(`Evento #${id} no encontrado`);

    const nuevoEstado = await this.prisma.estadoEvento.findUnique({ where: { nombre: dto.estado } });
    if (!nuevoEstado) throw new BadRequestException(`Estado '${dto.estado}' no existe`);

    return this.prisma.$transaction(async (tx) => {
      const eventoActualizado = await tx.evento.update({
        where: { id },
        data: { estadoId: nuevoEstado.id },
        include: INCLUDE_EVENTO,
      });

      await tx.historialEstado.create({
        data: {
          eventoId: id,
          estadoAnteriorId: evento.estadoId,
          estadoNuevoId: nuevoEstado.id,
          usuarioId,
        },
      });

      return eventoActualizado;
    });
  }
}
