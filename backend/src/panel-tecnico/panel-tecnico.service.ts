import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrosEventosDto } from './dto/filtros-eventos.dto';

// Escapa un valor para incluirlo de forma segura en una celda CSV.
function csvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

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
            id: true, codigo: true, nombre: true, direccion: true, verificado: true,
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
        fotos: { select: { urlImagen: true } },
        desague: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            verificado: true,
            sector: { select: { nombre: true } },
          },
        },
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

  // US-18: ranking de sectores por reportes resueltos y % de efectividad.
  async getRankingSectores() {
    const eventos = await this.prisma.evento.findMany({
      select: {
        estado: { select: { nombre: true } },
        desague: { select: { sector: { select: { id: true, nombre: true } } } },
      },
    });

    const mapa = new Map<
      number,
      { sectorId: number; nombre: string; total: number; resueltos: number; pendientes: number; enProceso: number }
    >();

    for (const e of eventos) {
      const sector = e.desague?.sector;
      if (!sector) continue;
      if (!mapa.has(sector.id)) {
        mapa.set(sector.id, {
          sectorId: sector.id,
          nombre: sector.nombre,
          total: 0,
          resueltos: 0,
          pendientes: 0,
          enProceso: 0,
        });
      }
      const acc = mapa.get(sector.id)!;
      acc.total += 1;
      if (e.estado.nombre === 'resuelto') acc.resueltos += 1;
      else if (e.estado.nombre === 'en_proceso') acc.enProceso += 1;
      else if (e.estado.nombre === 'pendiente') acc.pendientes += 1;
    }

    return [...mapa.values()]
      .map((s) => ({
        ...s,
        efectividad: s.total > 0 ? Math.round((s.resueltos / s.total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.resueltos - a.resueltos || b.efectividad - a.efectividad);
  }

  // US-13: lista de desagües con su recuento de reportes (para elegir uno).
  async getDesaguesConHistorial() {
    const desagues = await this.prisma.desague.findMany({
      select: {
        id: true,
        codigo: true,
        nombre: true,
        direccion: true,
        verificado: true,
        sector: { select: { nombre: true } },
        eventos: {
          select: { fechaEvento: true, estado: { select: { nombre: true } } },
          orderBy: { fechaEvento: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    return desagues
      .map((d) => {
        const total = d.eventos.length;
        const resueltos = d.eventos.filter((e) => e.estado.nombre === 'resuelto').length;
        return {
          id: d.id,
          codigo: d.codigo,
          nombre: d.nombre,
          direccion: d.direccion,
          verificado: d.verificado,
          sector: d.sector?.nombre ?? null,
          totalReportes: total,
          resueltos,
          recurrente: total >= 3,
          ultimoReporte: d.eventos[0]?.fechaEvento ?? null,
        };
      })
      .sort((a, b) => b.totalReportes - a.totalReportes);
  }

  // US-13: historial cronológico completo de un desagüe + indicador de frecuencia.
  async getHistorialDesague(id: number) {
    const desague = await this.prisma.desague.findUnique({
      where: { id },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        direccion: true,
        verificado: true,
        latitud: true,
        longitud: true,
        sector: { select: { id: true, nombre: true } },
        tipoDesague: { select: { nombre: true } },
      },
    });
    if (!desague) throw new NotFoundException(`Desagüe #${id} no encontrado`);

    const reportes = await this.prisma.evento.findMany({
      where: { desagueId: id },
      select: {
        id: true,
        descripcion: true,
        fechaEvento: true,
        usuario: { select: { nombre: true, apellido: true } },
        prioridad: { select: { nombre: true } },
        estado: { select: { nombre: true } },
      },
      orderBy: { fechaEvento: 'desc' },
    });

    const total = reportes.length;
    const resueltos = reportes.filter((r) => r.estado.nombre === 'resuelto').length;

    // Frecuencia media de obstrucción (reportes por mes) desde el primer reporte.
    let frecuenciaMensual = 0;
    if (total >= 2) {
      const fechas = reportes.map((r) => new Date(r.fechaEvento).getTime());
      const meses = (Math.max(...fechas) - Math.min(...fechas)) / (1000 * 60 * 60 * 24 * 30);
      frecuenciaMensual = meses > 0 ? Math.round((total / meses) * 10) / 10 : total;
    }

    return {
      desague: {
        ...desague,
        latitud: Number(desague.latitud),
        longitud: Number(desague.longitud),
      },
      totalReportes: total,
      resueltos,
      recurrente: total >= 3,
      frecuenciaMensual,
      reportes,
    };
  }

  // US-15: reporte histórico de incidencias en CSV (con filtro opcional de fechas).
  async exportarCsv(desde?: string, hasta?: string): Promise<string> {
    const where: any = {};
    if (desde || hasta) {
      where.fechaEvento = {};
      if (desde) where.fechaEvento.gte = new Date(desde);
      if (hasta) {
        // 'hasta' inclusivo hasta el final del día.
        const fin = new Date(hasta);
        fin.setHours(23, 59, 59, 999);
        where.fechaEvento.lte = fin;
      }
    }

    const eventos = await this.prisma.evento.findMany({
      where,
      include: {
        desague: { select: { codigo: true, sector: { select: { nombre: true } } } },
        prioridad: { select: { nombre: true } },
        estado: { select: { nombre: true } },
        orden: {
          select: {
            resultado: { select: { nombre: true } },
            tecnico: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fechaEvento: 'asc' },
    });

    const headers = [
      'ID',
      'Fecha',
      'Latitud',
      'Longitud',
      'Sector',
      'Codigo_Desague',
      'Prioridad',
      'Estado',
      'Responsable',
    ];

    const filas = eventos.map((e) =>
      [
        e.id,
        new Date(e.fechaEvento).toISOString(),
        Number(e.latitud),
        Number(e.longitud),
        e.desague?.sector?.nombre ?? '',
        e.desague?.codigo ?? '',
        e.prioridad.nombre,
        e.estado.nombre,
        e.orden?.tecnico ? `${e.orden.tecnico.nombre} ${e.orden.tecnico.apellido}` : '',
      ]
        .map(csvCell)
        .join(','),
    );

    // BOM para que Excel abra los acentos correctamente.
    return '﻿' + [headers.join(','), ...filas].join('\r\n');
  }
}
