import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const SELECT_USUARIO = {
  id: true,
  nombre: true,
  apellido: true,
  correo: true,
  telefono: true,
  tipoUsuario: { select: { id: true, nombre: true } },
  fechaRegistro: true,
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const existe = await this.prisma.usuario.findUnique({ where: { correo: dto.correo } });
    if (existe) throw new ConflictException('El correo ya esta registrado');

    const tipo = await this.prisma.tipoUsuario.findUnique({ where: { nombre: dto.tipoUsuario } });
    if (!tipo) throw new BadRequestException(`Tipo de usuario '${dto.tipoUsuario}' no existe`);

    const contrasenaHash = await bcrypt.hash(dto.contrasena, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        telefono: dto.telefono ?? null,
        contrasenaHash,
        tipoUsuarioId: tipo.id,
      },
      select: SELECT_USUARIO,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      select: SELECT_USUARIO,
      orderBy: { fechaRegistro: 'desc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: SELECT_USUARIO,
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    const data: any = {
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
    };

    if (dto.tipoUsuario) {
      const tipo = await this.prisma.tipoUsuario.findUnique({ where: { nombre: dto.tipoUsuario } });
      if (!tipo) throw new BadRequestException(`Tipo de usuario '${dto.tipoUsuario}' no existe`);
      data.tipoUsuarioId = tipo.id;
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: SELECT_USUARIO,
    });
  }
}
