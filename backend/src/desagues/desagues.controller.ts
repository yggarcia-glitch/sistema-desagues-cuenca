import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateDesagueDto } from './dto/create-desague.dto';
import { UpdateDesagueDto } from './dto/update-desague.dto';
import { DesaguesService } from './desagues.service';

@Controller('desagues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DesaguesController {
  constructor(private readonly desaguesService: DesaguesService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateDesagueDto) {
    return this.desaguesService.create(dto);
  }

  @Get()
  findAll() {
    return this.desaguesService.findAll();
  }

  // US-14: /desagues/cercanos?lat=-2.9&lng=-79&radio=100 (radio en metros).
  // Declarado antes de :id para que 'cercanos' no se interprete como id.
  @Get('cercanos')
  findCercanos(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radio') radio?: string,
  ) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      throw new BadRequestException('Parámetros lat y lng son obligatorios y deben ser numéricos');
    }
    const radioNum = radio !== undefined ? Number(radio) : 100;
    if (Number.isNaN(radioNum) || radioNum <= 0 || radioNum > 2000) {
      throw new BadRequestException('radio debe ser un número entre 1 y 2000 metros');
    }
    return this.desaguesService.findCercanos(latNum, lngNum, radioNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.desaguesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDesagueDto) {
    return this.desaguesService.update(id, dto);
  }
}
