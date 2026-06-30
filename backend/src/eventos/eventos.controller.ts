import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { EventosService } from './eventos.service';

@Controller('eventos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @Roles('ciudadano')
  create(
    @Body() dto: CreateEventoDto,
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.eventosService.create(dto, req.user.id);
  }

  @Get()
  @Roles('tecnico', 'admin')
  findAll() {
    return this.eventosService.findAll();
  }

  @Get('mis-reportes')
  @Roles('ciudadano')
  findMios(@Req() req: Request & { user: { id: number } }) {
    return this.eventosService.findMios(req.user.id);
  }

  @Get(':id')
  @Roles('tecnico', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.findOne(id);
  }

  @Patch(':id/estado')
  @Roles('tecnico', 'admin')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.eventosService.updateEstado(id, dto, req.user.id);
  }
}
