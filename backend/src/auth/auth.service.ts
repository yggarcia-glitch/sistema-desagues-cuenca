import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SELECT_USUARIO_PUBLICO = {
  id: true,
  nombre: true,
  apellido: true,
  correo: true,
  tipoUsuario: { select: { nombre: true } },
  fechaRegistro: true,
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.prisma.usuario.findUnique({ where: { correo: dto.correo } });
    if (existe) throw new ConflictException('El correo ya esta registrado');

    const tipoCiudadano = await this.prisma.tipoUsuario.findUniqueOrThrow({
      where: { nombre: 'ciudadano' },
    });

    const contrasenaHash = await bcrypt.hash(dto.contrasena, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        telefono: dto.telefono ?? null,
        contrasenaHash,
        tipoUsuarioId: tipoCiudadano.id,
      },
      select: SELECT_USUARIO_PUBLICO,
    });

    const token = this.generarToken(usuario.id, usuario.correo, usuario.tipoUsuario.nombre);
    return { mensaje: 'Usuario registrado exitosamente', usuario, token };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
      include: { tipoUsuario: true },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const contrasenaValida = await bcrypt.compare(dto.contrasena, usuario.contrasenaHash);
    if (!contrasenaValida) throw new UnauthorizedException('Credenciales incorrectas');

    const token = this.generarToken(usuario.id, usuario.correo, usuario.tipoUsuario.nombre);

    return {
      mensaje: 'Inicio de sesion exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        tipoUsuario: usuario.tipoUsuario.nombre,
      },
      token,
    };
  }

  private generarToken(id: number, correo: string, tipo: string) {
    return this.jwt.sign({ id, correo, tipo });
  }
}
