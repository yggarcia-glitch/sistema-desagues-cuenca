import { Controller, Get, Param, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FiltrosEventosDto } from './dto/filtros-eventos.dto';
import { PanelTecnicoService } from './panel-tecnico.service';

@Controller('panel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('tecnico', 'admin')
export class PanelTecnicoController {
  constructor(private readonly panelTecnicoService: PanelTecnicoService) {}

  // Lista todos los eventos con filtros opcionales: ?estado=pendiente&prioridad=alta&sectorId=1
  @Get('eventos')
  getEventos(@Query() filtros: FiltrosEventosDto) {
    return this.panelTecnicoService.getEventos(filtros);
  }

  // Retorna eventos en formato ligero para renderizar en mapa (id, lat, lng, estado, prioridad)
  @Get('eventos/mapa')
  getEventosMapa() {
    return this.panelTecnicoService.getEventosMapa();
  }

  // Retorna métricas: total eventos, cantidad por estado, por sector y tiempo promedio de resolución
  @Get('estadisticas')
  getEstadisticas() {
    return this.panelTecnicoService.getEstadisticas();
  }

  // Retorna eventos prioridad alta/media que están pendientes o en proceso, ordenados por más antiguos
  @Get('eventos/criticos')
  getEventosCriticos() {
    return this.panelTecnicoService.getEventosCriticos();
  }

  // Retorna sectores ordenados por cantidad de eventos pendientes (más críticos primero)
  @Get('sectores/criticos')
  getSectoresCriticos() {
    return this.panelTecnicoService.getSectoresCriticos();
  }

  // US-18: ranking de sectores por reportes resueltos y % de efectividad
  @Get('sectores/ranking')
  getRankingSectores() {
    return this.panelTecnicoService.getRankingSectores();
  }

  // US-13: lista de desagües con su recuento de reportes
  @Get('desagues/historial')
  getDesaguesConHistorial() {
    return this.panelTecnicoService.getDesaguesConHistorial();
  }

  // US-13: historial cronológico de un desagüe específico + frecuencia de obstrucción
  @Get('desagues/:id/historial')
  getHistorialDesague(@Param('id', ParseIntPipe) id: number) {
    return this.panelTecnicoService.getHistorialDesague(id);
  }

  // US-15: exporta el histórico de incidencias en CSV. ?desde=2026-01-01&hasta=2026-06-30
  @Get('export/csv')
  async exportarCsv(
    @Res() res: Response,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const csv = await this.panelTecnicoService.exportarCsv(desde, hasta);
    const nombre = `reportes_desagues_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
    res.send(csv);
  }
}
