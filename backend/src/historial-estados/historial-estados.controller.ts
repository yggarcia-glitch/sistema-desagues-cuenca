import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { HistorialEstadosService } from './historial-estados.service';

@Controller('historial-estados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistorialEstadosController {
  constructor(private readonly historialService: HistorialEstadosService) {}

  @Get()
  @Roles('tecnico', 'admin')
  findAll() {
    return this.historialService.findAll();
  }

  // Ruta específica ANTES de /:id para evitar conflicto de parámetros
  @Get('evento/:eventoId')
  findByEvento(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.historialService.findByEvento(eventoId);
  }

  @Get(':id')
  @Roles('tecnico', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findOne(id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.remove(id);
  }
}
