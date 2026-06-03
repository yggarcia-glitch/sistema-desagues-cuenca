import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FotosEvidenciaController } from './fotos-evidencia.controller';
import { FotosEvidenciaService } from './fotos-evidencia.service';

@Module({
  imports: [AuthModule],
  controllers: [FotosEvidenciaController],
  providers: [FotosEvidenciaService],
})
export class FotosEvidenciaModule {}
