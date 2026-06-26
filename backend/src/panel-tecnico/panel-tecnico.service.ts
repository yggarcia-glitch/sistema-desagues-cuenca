import { Injectable } from '@nestjs/common';
import { EstadoEvento, Prioridad } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrosEventosDto } from './dto/filtros-eventos.dto';

@Injectable()
export class PanelTecnicoService {
  constructor(private readonly prisma: PrismaService) {}

  // Lista todos los eventos con filtros opcionales por estado, prioridad y sector
  async getEventos(filtros: FiltrosEventosDto) {
    const where: {
      estado?: EstadoEvento;
      prioridad?: Prioridad;
      desague?: { sectorId: number };
    } = {};

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.prioridad) where.prioridad = filtros.prioridad;
    if (filtros.sectorId) where.desague = { sectorId: filtros.sectorId };

    return this.prisma.evento.findMany({
      where,
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
        desague: {
          select: {
            id: true,
            codigo: true,
            direccion: true,
            tipoDesague: true,
            sector: { select: { id: true, nombre: true } },
          },
        },
        fotos: { select: { urlImagen: true } },
        orden: { select: { id: true, fechaAsignacion: true, resultado: true } },
      },
      orderBy: [{ prioridad: 'asc' }, { fechaEvento: 'desc' }],
    });
  }

  // Devuelve solo los campos necesarios para renderizar marcadores en un mapa
  async getEventosMapa() {
    return this.prisma.evento.findMany({
      select: {
        id: true,
        latitud: true,
        longitud: true,
        estado: true,
        prioridad: true,
        descripcion: true,
        desague: {
          select: { sector: { select: { nombre: true } } },
        },
      },
    });
  }

  // Devuelve métricas agregadas: totales, por estado, por sector y tiempo promedio de resolución
  async getEstadisticas() {
    const [total, porEstado, porSector, eventosResueltos] = await Promise.all([
      this.prisma.evento.count(),

      this.prisma.evento.groupBy({
        by: ['estado'],
        _count: { id: true },
      }),

      this.prisma.evento.groupBy({
        by: ['desagueId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      this.prisma.evento.findMany({
        where: {
          estado: EstadoEvento.resuelto,
          orden: { fechaIntervencion: { not: null } },
        },
        select: {
          fechaEvento: true,
          orden: { select: { fechaIntervencion: true } },
        },
      }),
    ]);

    const tiempoPromedioHoras =
      eventosResueltos.length > 0
        ? eventosResueltos.reduce((acc, e) => {
            const diff =
              new Date(e.orden!.fechaIntervencion!).getTime() -
              new Date(e.fechaEvento).getTime();
            return acc + diff / (1000 * 60 * 60);
          }, 0) / eventosResueltos.length
        : null;

    const sectoresConNombre = await Promise.all(
      porSector.map(async (item) => {
        const desague = await this.prisma.desague.findUnique({
          where: { id: item.desagueId },
          select: { sector: { select: { nombre: true } } },
        });
        return { sector: desague?.sector?.nombre ?? 'Desconocido', total: item._count.id };
      }),
    );

    return {
      total,
      porEstado: porEstado.map((e) => ({ estado: e.estado, cantidad: e._count.id })),
      porSector: sectoresConNombre,
      tiempoPromedioResolucionHoras: tiempoPromedioHoras
        ? Math.round(tiempoPromedioHoras * 10) / 10
        : null,
    };
  }

  // Devuelve sectores ordenados de mayor a menor cantidad de eventos pendientes
  async getSectoresCriticos() {
    const grupos = await this.prisma.evento.groupBy({
      by: ['desagueId'],
      where: { estado: EstadoEvento.pendiente },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const resultado = await Promise.all(
      grupos.map(async (item) => {
        const desague = await this.prisma.desague.findUnique({
          where: { id: item.desagueId },
          select: {
            sectorId: true,
            sector: { select: { id: true, nombre: true, descripcion: true } },
          },
        });
        return {
          sectorId: desague?.sector?.id,
          nombre: desague?.sector?.nombre ?? 'Desconocido',
          descripcion: desague?.sector?.descripcion ?? '',
          eventosPendientes: item._count.id,
        };
      }),
    );

    // Consolidar sectores duplicados (varios desagües del mismo sector)
    const mapa = new Map<number, (typeof resultado)[0]>();
    for (const r of resultado) {
      if (!r.sectorId) continue;
      if (mapa.has(r.sectorId)) {
        mapa.get(r.sectorId)!.eventosPendientes += r.eventosPendientes;
      } else {
        mapa.set(r.sectorId, { ...r });
      }
    }

    return [...mapa.values()].sort((a, b) => b.eventosPendientes - a.eventosPendientes);
  }
}
