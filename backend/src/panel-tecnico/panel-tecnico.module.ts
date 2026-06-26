import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PanelTecnicoController } from './panel-tecnico.controller';
import { PanelTecnicoService } from './panel-tecnico.service';

@Module({
  imports: [PrismaModule],
  controllers: [PanelTecnicoController],
  providers: [PanelTecnicoService],
})
export class PanelTecnicoModule {}
