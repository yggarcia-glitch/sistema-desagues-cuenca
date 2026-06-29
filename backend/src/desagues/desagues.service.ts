import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesagueDto } from './dto/create-desague.dto';
import { UpdateDesagueDto } from './dto/update-desague.dto';

const INCLUDE_DESAGUE = {
  tipoDesague: { select: { id: true, nombre: true } },
  sector: { select: { id: true, nombre: true } },
};

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
