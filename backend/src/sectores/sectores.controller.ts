import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { SectoresService } from './sectores.service';

@Controller('sectores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectoresController {
  constructor(private readonly sectoresService: SectoresService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateSectorDto) {
    return this.sectoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.sectoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectoresService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectorDto) {
    return this.sectoresService.update(id, dto);
  }
}
