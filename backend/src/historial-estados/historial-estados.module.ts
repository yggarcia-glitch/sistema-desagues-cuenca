import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HistorialEstadosController } from './historial-estados.controller';
import { HistorialEstadosService } from './historial-estados.service';

@Module({
  imports: [PrismaModule],
  controllers: [HistorialEstadosController],
  providers: [HistorialEstadosService],
})
export class HistorialEstadosModule {}
