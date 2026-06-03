import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Verificar correo unico
    const existe = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });
    if (existe) {
      throw new ConflictException('El correo ya esta registrado');
    }

    // Hash de contrasena
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(dto.contrasena, salt);

    // Crear usuario
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        telefono: dto.telefono ?? null,
        contrasenaHash,
        tipoUsuario: 'ciudadano',
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        tipoUsuario: true,
        fechaRegistro: true,
      },
    });

    const token = this.generarToken(usuario.id, usuario.correo, usuario.tipoUsuario);

    return { mensaje: 'Usuario registrado exitosamente', usuario, token };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const contrasenaValida = await bcrypt.compare(dto.contrasena, usuario.contrasenaHash);
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.generarToken(usuario.id, usuario.correo, usuario.tipoUsuario);

    return {
      mensaje: 'Inicio de sesion exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        tipoUsuario: usuario.tipoUsuario,
      },
      token,
    };
  }

  private generarToken(id: number, correo: string, tipo: string) {
    return this.jwt.sign({ id, correo, tipo });
  }
}
