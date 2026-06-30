import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

const RADIO_METROS = 60;

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const INCLUDE_EVENTO = {
  usuario: { select: { id: true, nombre: true, apellido: true } },
  desague: { select: { id: true, codigo: true, direccion: true, verificado: true } },
  prioridad: { select: { id: true, nombre: true } },
  estado: { select: { id: true, nombre: true } },
};

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolverDesague(lat: number, lng: number): Promise<number> {
    const desagues = await this.prisma.desague.findMany({
      select: { id: true, latitud: true, longitud: true },
    });

    let mejorId: number | null = null;
    let mejorDist = Infinity;

    for (const d of desagues) {
      const dist = distanciaMetros(lat, lng, Number(d.latitud), Number(d.longitud));
      if (dist < mejorDist) {
        mejorDist = dist;
        mejorId = d.id;
      }
    }

    if (mejorId !== null && mejorDist <= RADIO_METROS) {
      return mejorId;
    }

    // Ningún desagüe cercano — crear uno nuevo no verificado
    const tipoSumidero = await this.prisma.tipoDesague.findUnique({ where: { nombre: 'sumidero' } });

    // Buscar el sector más cercano
    const sectores = await this.prisma.sector.findMany({
      include: {
        desagues: { select: { latitud: true, longitud: true }, take: 5 },
      },
    });

    let sectorId: number | undefined;
    let menorDistSector = Infinity;
    for (const s of sectores) {
      for (const d of s.desagues) {
        const dist = distanciaMetros(lat, lng, Number(d.latitud), Number(d.longitud));
        if (dist < menorDistSector) {
          menorDistSector = dist;
          sectorId = s.id;
        }
      }
    }

    const nuevo = await this.prisma.desague.create({
      data: {
        codigo: `AUTO-${Date.now()}`,
        latitud: lat,
        longitud: lng,
        direccion: `Reportado en (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        tipoDesagueId: tipoSumidero?.id ?? undefined,
        sectorId: sectorId ?? undefined,
        verificado: false,
        fuenteDatos: 'ciudadano',
      },
    });

    return nuevo.id;
  }

  async create(dto: CreateEventoDto, usuarioId: number) {
    const prioridad = await this.prisma.prioridad.findUnique({ where: { nombre: dto.prioridad } });
    if (!prioridad) throw new BadRequestException(`Prioridad '${dto.prioridad}' no existe`);

    const estadoPendiente = await this.prisma.estadoEvento.findUnique({ where: { nombre: 'pendiente' } });

    const desagueId = await this.resolverDesague(dto.latitud, dto.longitud);

    return this.prisma.evento.create({
      data: {
        usuarioId,
        desagueId,
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
