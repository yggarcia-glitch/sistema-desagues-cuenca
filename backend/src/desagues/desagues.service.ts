import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesagueDto } from './dto/create-desague.dto';
import { UpdateDesagueDto } from './dto/update-desague.dto';

const INCLUDE_DESAGUE = {
  tipoDesague: { select: { id: true, nombre: true } },
  sector: { select: { id: true, nombre: true } },
};

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class DesaguesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDesagueDto) {
    const tipo = await this.prisma.tipoDesague.findUnique({ where: { nombre: dto.tipoDesague } });
    if (!tipo) throw new BadRequestException(`Tipo de desague '${dto.tipoDesague}' no existe`);

    return this.prisma.desague.create({
      data: {
        codigo: dto.codigo,
        latitud: dto.latitud,
        longitud: dto.longitud,
        direccion: dto.direccion,
        tipoDesagueId: tipo.id,
        sectorId: dto.sectorId,
      },
      include: INCLUDE_DESAGUE,
    });
  }

  findAll() {
    return this.prisma.desague.findMany({
      include: INCLUDE_DESAGUE,
      orderBy: { id: 'asc' },
    });
  }

  // US-14: desagües dentro de un radio (metros) desde una ubicación dada,
  // ordenados del más cercano al más lejano.
  async findCercanos(lat: number, lng: number, radio: number) {
    const desagues = await this.prisma.desague.findMany({ include: INCLUDE_DESAGUE });

    return desagues
      .map((d) => ({
        ...d,
        distancia: Math.round(distanciaMetros(lat, lng, Number(d.latitud), Number(d.longitud))),
      }))
      .filter((d) => d.distancia <= radio)
      .sort((a, b) => a.distancia - b.distancia);
  }

  async findOne(id: number) {
    const desague = await this.prisma.desague.findUnique({
      where: { id },
      include: {
        ...INCLUDE_DESAGUE,
        sector: { select: { id: true, nombre: true, descripcion: true } },
        eventos: {
          select: {
            id: true, descripcion: true,
            estado: { select: { nombre: true } },
            prioridad: { select: { nombre: true } },
            fechaEvento: true,
          },
          orderBy: { fechaEvento: 'desc' },
          take: 10,
        },
      },
    });
    if (!desague) throw new NotFoundException(`Desague #${id} no encontrado`);
    return desague;
  }

  async update(id: number, dto: UpdateDesagueDto) {
    await this.findOne(id);

    const data: any = {
      codigo: dto.codigo,
      direccion: dto.direccion,
      sectorId: dto.sectorId,
    };

    if (dto.tipoDesague) {
      const tipo = await this.prisma.tipoDesague.findUnique({ where: { nombre: dto.tipoDesague } });
      if (!tipo) throw new BadRequestException(`Tipo de desague '${dto.tipoDesague}' no existe`);
      data.tipoDesagueId = tipo.id;
    }

    return this.prisma.desague.update({
      where: { id },
      data,
      include: INCLUDE_DESAGUE,
    });
  }
}
