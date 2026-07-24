import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { ResolverEventoDto } from './dto/resolver-evento.dto';

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
  desague: { select: { id: true, codigo: true, nombre: true, direccion: true, verificado: true } },
  prioridad: { select: { id: true, nombre: true } },
  estado: { select: { id: true, nombre: true } },
};

@Injectable()
export class EventosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

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

    const evento = await this.prisma.evento.create({
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

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { correo: true, nombre: true },
    });
    if (usuario) {
      void this.mail.reporteCreado({
        correo: usuario.correo,
        nombre: usuario.nombre,
        eventoId: evento.id,
        descripcion: evento.descripcion,
      });
    }

    return evento;
  }

  findAll() {
    return this.prisma.evento.findMany({
      include: { ...INCLUDE_EVENTO, fotos: true },
      orderBy: { fechaEvento: 'desc' },
    });
  }

  findMios(usuarioId: number) {
    return this.prisma.evento.findMany({
      where: { usuarioId },
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

    if (dto.estado === 'resuelto') {
      throw new BadRequestException(
        'Para marcar como resuelto usa la opcion de resolucion: es obligatorio adjuntar una foto de la alcantarilla limpia',
      );
    }

    const nuevoEstado = await this.prisma.estadoEvento.findUnique({ where: { nombre: dto.estado } });
    if (!nuevoEstado) throw new BadRequestException(`Estado '${dto.estado}' no existe`);

    const eventoActualizado = await this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.evento.update({
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

      return actualizado;
    });

    await this.notificarCambioEstado(id, dto.estado);

    return eventoActualizado;
  }

  /**
   * Marca un evento como resuelto. Requiere SI o SI una foto de la alcantarilla
   * limpia (filePath ya guardado por Multer). Si se envian codigoDesague o
   * nombreDesague, registra/actualiza la alcantarilla asociada (por si no
   * existia formalmente en la base) y la marca como verificada.
   */
  async resolver(id: number, filePath: string, dto: ResolverEventoDto, usuarioId: number) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) {
      await unlink(filePath).catch(() => null);
      throw new NotFoundException(`Evento #${id} no encontrado`);
    }

    const estadoResuelto = await this.prisma.estadoEvento.findUnique({ where: { nombre: 'resuelto' } });
    if (!estadoResuelto) {
      await unlink(filePath).catch(() => null);
      throw new BadRequestException("El estado 'resuelto' no existe");
    }

    const eventoActualizado = await this.prisma.$transaction(async (tx) => {
      // Foto de la alcantarilla limpia (evidencia obligatoria del trabajo).
      await tx.fotoEvidencia.create({ data: { eventoId: id, urlImagen: filePath } });

      // Registro opcional de la alcantarilla si el tecnico proporciono datos.
      if (dto.codigoDesague || dto.nombreDesague) {
        await tx.desague.update({
          where: { id: evento.desagueId },
          data: {
            ...(dto.codigoDesague ? { codigo: dto.codigoDesague } : {}),
            ...(dto.nombreDesague ? { nombre: dto.nombreDesague } : {}),
            verificado: true,
            fuenteDatos: 'tecnico',
          },
        });
      }

      const actualizado = await tx.evento.update({
        where: { id },
        data: { estadoId: estadoResuelto.id },
        include: INCLUDE_EVENTO,
      });

      await tx.historialEstado.create({
        data: {
          eventoId: id,
          estadoAnteriorId: evento.estadoId,
          estadoNuevoId: estadoResuelto.id,
          usuarioId,
        },
      });

      return actualizado;
    });

    await this.notificarCambioEstado(id, 'resuelto');

    return eventoActualizado;
  }

  private async notificarCambioEstado(eventoId: number, estado: string) {
    if (estado !== 'en_proceso' && estado !== 'resuelto') return;

    const evento = await this.prisma.evento.findUnique({
      where: { id: eventoId },
      select: {
        id: true,
        descripcion: true,
        usuario: { select: { correo: true, nombre: true } },
        fotos: { orderBy: { fechaCaptura: 'desc' }, take: 1, select: { urlImagen: true } },
      },
    });
    if (!evento?.usuario) return;

    const base = {
      correo: evento.usuario.correo,
      nombre: evento.usuario.nombre,
      eventoId: evento.id,
      descripcion: evento.descripcion,
    };

    if (estado === 'en_proceso') {
      void this.mail.reparacionIniciada(base);
    } else {
      // Foto de evidencia opcional por ahora (a futuro sera obligatoria)
      void this.mail.reporteResuelto({ ...base, fotoPath: evento.fotos[0]?.urlImagen ?? null });
    }
  }
}
