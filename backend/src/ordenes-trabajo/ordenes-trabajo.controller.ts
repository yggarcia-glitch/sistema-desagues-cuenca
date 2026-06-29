import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { OrdenesTrabajosService } from './ordenes-trabajo.service';

@Controller('ordenes-trabajo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdenesTrabajosController {
  constructor(private readonly ordenesService: OrdenesTrabajosService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateOrdenDto) {
    return this.ordenesService.create(dto);
  }

  @Get()
  @Roles('tecnico', 'admin')
  findAll() {
    return this.ordenesService.findAll();
  }

  @Get(':id')
  @Roles('tecnico', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordenesService.findOne(id);
  }

  @Patch(':id')
  @Roles('tecnico', 'admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrdenDto) {
    return this.ordenesService.update(id, dto);
  }
}
