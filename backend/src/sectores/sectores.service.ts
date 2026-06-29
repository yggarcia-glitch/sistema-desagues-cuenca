import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectoresService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSectorDto) {
    return this.prisma.sector.create({ data: dto });
  }

  findAll() {
    return this.prisma.sector.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(id: number) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: {
        desagues: {
          select: { id: true, codigo: true, direccion: true, tipoDesague: true },
        },
      },
    });
    if (!sector) throw new NotFoundException(`Sector #${id} no encontrado`);
    return sector;
  }

  async update(id: number, dto: UpdateSectorDto) {
    await this.findOne(id);
    return this.prisma.sector.update({ where: { id }, data: dto });
  }
}
