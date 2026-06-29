import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DesaguesController } from './desagues.controller';
import { DesaguesService } from './desagues.service';

@Module({
  imports: [PrismaModule],
  controllers: [DesaguesController],
  providers: [DesaguesService],
})
export class DesaguesModule {}
