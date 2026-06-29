import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventosModule } from './eventos/eventos.module';
import { FotosEvidenciaModule } from './fotos-evidencia/fotos-evidencia.module';
import { PanelTecnicoModule } from './panel-tecnico/panel-tecnico.module';
import { SectoresModule } from './sectores/sectores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { DesaguesModule } from './desagues/desagues.module';
import { OrdenesTrabajosModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { HistorialEstadosModule } from './historial-estados/historial-estados.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EventosModule,
    FotosEvidenciaModule,
    PanelTecnicoModule,
    SectoresModule,
    UsuariosModule,
    DesaguesModule,
    OrdenesTrabajosModule,
    HistorialEstadosModule,
  ],
})
export class AppModule {}
