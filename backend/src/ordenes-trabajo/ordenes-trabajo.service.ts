import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

const INCLUDE_ORDEN = {
  evento: { select: { id: true, descripcion: true, estado: { select: { nombre: true } }, prioridad: { select: { nombre: true } } } },
  tecnico: { select: { id: true, nombre: true, apellido: true } },
  resultado: { select: { id: true, nombre: true } },
};

@Injectable()
export class OrdenesTrabajosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrdenDto) {
    const evento = await this.prisma.evento.findUnique({ where: { id: dto.eventoId } });
    if (!evento) throw new NotFoundException(`Evento #${dto.eventoId} no encontrado`);

    const existente = await this.prisma.ordenTrabajo.findUnique({ where: { eventoId: dto.eventoId } });
    if (existente) throw new BadRequestException(`El evento #${dto.eventoId} ya tiene una orden de trabajo`);

    const tecnico = await this.prisma.usuario.findUnique({
      where: { id: dto.tecnicoId },
      include: { tipoUsuario: true },
    });
    if (!tecnico || tecnico.tipoUsuario.nombre === 'ciudadano') {
      throw new BadRequestException(`El usuario #${dto.tecnicoId} no es un tecnico valido`);
    }

    return this.prisma.ordenTrabajo.create({
      data: { eventoId: dto.eventoId, tecnicoId: dto.tecnicoId },
      include: INCLUDE_ORDEN,
    });
  }

  findAll() {
    return this.prisma.ordenTrabajo.findMany({
      include: INCLUDE_ORDEN,
      orderBy: { fechaAsignacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const orden = await this.prisma.ordenTrabajo.findUnique({
      where: { id },
      include: {
        evento: {
          select: {
            id: true, descripcion: true,
            estado: { select: { nombre: true } },
            prioridad: { select: { nombre: true } },
            latitud: true, longitud: true,
            desague: { select: { id: true, codigo: true, direccion: true } },
          },
        },
        tecnico: { select: { id: true, nombre: true, apellido: true, correo: true } },
        resultado: { select: { id: true, nombre: true } },
      },
    });
    if (!orden) throw new NotFoundException(`Orden de trabajo #${id} no encontrada`);
    return orden;
  }

  async update(id: number, dto: UpdateOrdenDto) {
    await this.findOne(id);

    const data: any = {
      observaciones: dto.observaciones,
      fechaIntervencion: dto.fechaIntervencion ? new Date(dto.fechaIntervencion) : undefined,
    };

    if (dto.resultado) {
      const resultado = await this.prisma.resultadoOrden.findUnique({ where: { nombre: dto.resultado } });
      if (!resultado) throw new BadRequestException(`Resultado '${dto.resultado}' no existe`);
      data.resultadoId = resultado.id;
    }

    return this.prisma.ordenTrabajo.update({
      where: { id },
      data,
      include: INCLUDE_ORDEN,
    });
  }
}
