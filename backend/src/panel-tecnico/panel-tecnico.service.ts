import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrosEventosDto } from './dto/filtros-eventos.dto';

@Injectable()
export class PanelTecnicoService {
  constructor(private readonly prisma: PrismaService) {}

  async getEventos(filtros: FiltrosEventosDto) {
    const where: any = {};

    if (filtros.estado) {
      const estado = await this.prisma.estadoEvento.findUnique({ where: { nombre: filtros.estado } });
      if (estado) where.estadoId = estado.id;
    }
    if (filtros.prioridad) {
      const prioridad = await this.prisma.prioridad.findUnique({ where: { nombre: filtros.prioridad } });
      if (prioridad) where.prioridadId = prioridad.id;
    }
    if (filtros.sectorId) {
      where.desague = { sectorId: filtros.sectorId };
    }

    return this.prisma.evento.findMany({
      where,
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
        desague: {
          select: {
            id: true, codigo: true, direccion: true,
            tipoDesague: { select: { nombre: true } },
            sector: { select: { id: true, nombre: true } },
          },
        },
        prioridad: { select: { id: true, nombre: true } },
        estado: { select: { id: true, nombre: true } },
        fotos: { select: { urlImagen: true } },
        orden: { select: { id: true, fechaAsignacion: true, resultado: { select: { nombre: true } } } },
      },
      orderBy: { fechaEvento: 'desc' },
    });
  }

  getEventosMapa() {
    return this.prisma.evento.findMany({
      select: {
        id: true,
        latitud: true,
        longitud: true,
        estado: { select: { nombre: true } },
        prioridad: { select: { nombre: true } },
        descripcion: true,
        desague: { select: { sector: { select: { nombre: true } } } },
      },
    });
  }

  async getEstadisticas() {
    const [total, eventosConEstado, desaguesConEventos, eventosResueltos] = await Promise.all([
      this.prisma.evento.count(),

      this.prisma.evento.groupBy({
        by: ['estadoId'],
        _count: { id: true },
      }),

      this.prisma.evento.groupBy({
        by: ['desagueId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      this.prisma.evento.findMany({
        where: { estado: { nombre: 'resuelto' }, orden: { fechaIntervencion: { not: null } } },
        select: {
          fechaEvento: true,
          orden: { select: { fechaIntervencion: true } },
        },
      }),
    ]);

    const estados = await this.prisma.estadoEvento.findMany({ select: { id: true, nombre: true } });
    const estadoMap = new Map(estados.map((e) => [e.id, e.nombre]));

    const porEstado = eventosConEstado.map((e) => ({
      estado: estadoMap.get(e.estadoId) ?? 'desconocido',
      cantidad: e._count.id,
    }));

    const sectoresConNombre = await Promise.all(
      desaguesConEventos.map(async (item) => {
        const desague = await this.prisma.desague.findUnique({
          where: { id: item.desagueId },
          select: { sector: { select: { nombre: true } } },
        });
        return { sector: desague?.sector?.nombre ?? 'Desconocido', total: item._count.id };
      }),
    );

    const porSector = new Map<string, number>();
    for (const { sector, total } of sectoresConNombre) {
      porSector.set(sector, (porSector.get(sector) ?? 0) + total);
    }

    const tiempoPromedioHoras =
      eventosResueltos.length > 0
        ? eventosResueltos.reduce((acc, e) => {
            const diff =
              new Date(e.orden!.fechaIntervencion!).getTime() - new Date(e.fechaEvento).getTime();
            return acc + diff / (1000 * 60 * 60);
          }, 0) / eventosResueltos.length
        : null;

    return {
      total,
      porEstado,
      porSector: [...porSector.entries()].map(([sector, total]) => ({ sector, total })),
      tiempoPromedioResolucionHoras: tiempoPromedioHoras
        ? Math.round(tiempoPromedioHoras * 10) / 10
        : null,
    };
  }

  async getEventosCriticos() {
    const [prioridadAlta, prioridadMedia, pendiente, enProceso] = await Promise.all([
      this.prisma.prioridad.findUnique({ where: { nombre: 'alta' } }),
      this.prisma.prioridad.findUnique({ where: { nombre: 'media' } }),
      this.prisma.estadoEvento.findUnique({ where: { nombre: 'pendiente' } }),
      this.prisma.estadoEvento.findUnique({ where: { nombre: 'en_proceso' } }),
    ]);

    return this.prisma.evento.findMany({
      where: {
        prioridadId: { in: [prioridadAlta!.id, prioridadMedia!.id] },
        estadoId: { in: [pendiente!.id, enProceso!.id] },
      },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
        desague: { select: { sector: { select: { nombre: true } } } },
        prioridad: { select: { nombre: true } },
        estado: { select: { nombre: true } },
      },
      orderBy: { fechaEvento: 'asc' },
    });
  }

  async getSectoresCriticos() {
    const estadoPendiente = await this.prisma.estadoEvento.findUnique({ where: { nombre: 'pendiente' } });

    const grupos = await this.prisma.evento.groupBy({
      by: ['desagueId'],
      where: { estadoId: estadoPendiente!.id },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const resultado = await Promise.all(
      grupos.map(async (item) => {
        const desague = await this.prisma.desague.findUnique({
          where: { id: item.desagueId },
          select: { sector: { select: { id: true, nombre: true, descripcion: true } } },
        });
        return {
          sectorId: desague?.sector?.id,
          nombre: desague?.sector?.nombre ?? 'Desconocido',
          descripcion: desague?.sector?.descripcion ?? '',
          eventosPendientes: item._count.id,
        };
      }),
    );

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
