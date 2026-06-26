import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventosModule } from './eventos/eventos.module';
import { FotosEvidenciaModule } from './fotos-evidencia/fotos-evidencia.module';
import { PanelTecnicoModule } from './panel-tecnico/panel-tecnico.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EventosModule,
    FotosEvidenciaModule,
    PanelTecnicoModule,
  ],
})
export class AppModule {}
