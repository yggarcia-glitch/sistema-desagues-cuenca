import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SectoresController } from './sectores.controller';
import { SectoresService } from './sectores.service';

@Module({
  imports: [PrismaModule],
  controllers: [SectoresController],
  providers: [SectoresService],
})
export class SectoresModule {}
