import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdenesTrabajosController } from './ordenes-trabajo.controller';
import { OrdenesTrabajosService } from './ordenes-trabajo.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrdenesTrabajosController],
  providers: [OrdenesTrabajosService],
})
export class OrdenesTrabajosModule {}
