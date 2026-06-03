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
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { EventosService } from './eventos.service';

@Controller('eventos')
@UseGuards(JwtAuthGuard)
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  create(@Body() dto: CreateEventoDto) {
    return this.eventosService.create(dto);
  }

  @Get()
  findAll() {
    return this.eventosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.findOne(id);
  }

  @Patch(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.eventosService.updateEstado(id, dto, req.user.id);
  }
}
