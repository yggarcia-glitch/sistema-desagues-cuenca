import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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

  // Retorna sectores ordenados por cantidad de eventos pendientes (más críticos primero)
  @Get('sectores/criticos')
  getSectoresCriticos() {
    return this.panelTecnicoService.getSectoresCriticos();
  }
}
