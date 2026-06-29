import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
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
