import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Tablas de referencia ─────────────────────────────────────────────

  await prisma.tipoUsuario.createMany({
    data: [
      { nombre: 'ciudadano' },
      { nombre: 'tecnico' },
      { nombre: 'admin' },
    ],
    skipDuplicates: true,
  });

  await prisma.tipoDesague.createMany({
    data: [
      { nombre: 'sumidero' },
      { nombre: 'alcantarilla' },
      { nombre: 'cuneta' },
    ],
    skipDuplicates: true,
  });

  await prisma.prioridad.createMany({
    data: [
      { nombre: 'alta' },
      { nombre: 'media' },
      { nombre: 'baja' },
    ],
    skipDuplicates: true,
  });

  await prisma.estadoEvento.createMany({
    data: [
      { nombre: 'pendiente' },
      { nombre: 'en_proceso' },
      { nombre: 'resuelto' },
    ],
    skipDuplicates: true,
  });

  await prisma.resultadoOrden.createMany({
    data: [
      { nombre: 'resuelto' },
      { nombre: 'parcial' },
      { nombre: 'sin_solucion' },
    ],
    skipDuplicates: true,
  });

  console.log('✔ Tablas de referencia cargadas');

  // ── Referencias útiles ───────────────────────────────────────────────

  const [tipoCiudadano, tipoTecnico, tipoAdmin] = await Promise.all([
    prisma.tipoUsuario.findUnique({ where: { nombre: 'ciudadano' } }),
    prisma.tipoUsuario.findUnique({ where: { nombre: 'tecnico' } }),
    prisma.tipoUsuario.findUnique({ where: { nombre: 'admin' } }),
  ]);

  const [tipoSumidero, tipoAlcantarilla] = await Promise.all([
    prisma.tipoDesague.findUnique({ where: { nombre: 'sumidero' } }),
    prisma.tipoDesague.findUnique({ where: { nombre: 'alcantarilla' } }),
  ]);

  const [prioridadAlta, prioridadMedia] = await Promise.all([
    prisma.prioridad.findUnique({ where: { nombre: 'alta' } }),
    prisma.prioridad.findUnique({ where: { nombre: 'media' } }),
  ]);

  const [estadoPendiente, estadoEnProceso, estadoResuelto] = await Promise.all([
    prisma.estadoEvento.findUnique({ where: { nombre: 'pendiente' } }),
    prisma.estadoEvento.findUnique({ where: { nombre: 'en_proceso' } }),
    prisma.estadoEvento.findUnique({ where: { nombre: 'resuelto' } }),
  ]);

  const resultadoResuelto = await prisma.resultadoOrden.findUnique({ where: { nombre: 'resuelto' } });

  // ── Sectores ─────────────────────────────────────────────────────────

  const sectorCentro = await prisma.sector.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Centro Histórico', descripcion: 'Sector central de Cuenca, alta densidad poblacional' },
  });

  const sectorVecino = await prisma.sector.upsert({
    where: { id: 2 },
    update: {},
    create: { nombre: 'El Vecino', descripcion: 'Sector norte residencial de Cuenca' },
  });

  console.log('✔ Sectores cargados');

  // ── Usuarios ─────────────────────────────────────────────────────────

  const [hashAdmin, hashTec, hashCiu] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('Tecnico123!', 10),
    bcrypt.hash('Ciudadano123!', 10),
  ]);

  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@etapa.com' },
    update: {},
    create: {
      nombre: 'Carlos', apellido: 'Administrador',
      correo: 'admin@etapa.com',
      contrasenaHash: hashAdmin,
      tipoUsuarioId: tipoAdmin!.id,
    },
  });

  const tecnico = await prisma.usuario.upsert({
    where: { correo: 'tecnico@etapa.com' },
    update: {},
    create: {
      nombre: 'Maria', apellido: 'Tecnica',
      correo: 'tecnico@etapa.com',
      contrasenaHash: hashTec,
      tipoUsuarioId: tipoTecnico!.id,
    },
  });

  const ciudadano = await prisma.usuario.upsert({
    where: { correo: 'ciudadano@test.com' },
    update: {},
    create: {
      nombre: 'Yosef', apellido: 'Garcia',
      correo: 'ciudadano@test.com',
      telefono: '0991234567',
      contrasenaHash: hashCiu,
      tipoUsuarioId: tipoCiudadano!.id,
    },
  });

  console.log('✔ Usuarios cargados');
  console.log(`    admin     → ${admin.correo} / Admin123!`);
  console.log(`    tecnico   → ${tecnico.correo} / Tecnico123!`);
  console.log(`    ciudadano → ${ciudadano.correo} / Ciudadano123!`);

  // ── Desagües ─────────────────────────────────────────────────────────

  const desague1 = await prisma.desague.upsert({
    where: { id: 1 },
    update: {},
    create: {
      codigo: 'DES-001',
      latitud: -2.9001285,
      longitud: -79.0058965,
      direccion: 'Calle Larga y Av. Todos Santos',
      tipoDesagueId: tipoSumidero!.id,
      sectorId: sectorCentro.id,
    },
  });

  const desague2 = await prisma.desague.upsert({
    where: { id: 2 },
    update: {},
    create: {
      codigo: 'DES-002',
      latitud: -2.9120000,
      longitud: -79.0110000,
      direccion: 'Av. Ordoñez Lasso y Av. de las Américas',
      tipoDesagueId: tipoAlcantarilla!.id,
      sectorId: sectorVecino.id,
    },
  });

  console.log('✔ Desagües cargados');

  // ── Eventos de ejemplo ───────────────────────────────────────────────

  const evento1 = await prisma.evento.upsert({
    where: { id: 1 },
    update: {},
    create: {
      usuarioId: ciudadano.id,
      desagueId: desague1.id,
      descripcion: 'Sumidero completamente obstruido por acumulacion de hojas y basura frente al parque',
      latitud: -2.9001285,
      longitud: -79.0058965,
      prioridadId: prioridadAlta!.id,
      estadoId: estadoResuelto!.id,
    },
  });

  const evento2 = await prisma.evento.upsert({
    where: { id: 2 },
    update: {},
    create: {
      usuarioId: ciudadano.id,
      desagueId: desague1.id,
      descripcion: 'Alcantarilla bloqueada con escombros despues de las lluvias del fin de semana pasado',
      latitud: -2.9003000,
      longitud: -79.0060000,
      prioridadId: prioridadAlta!.id,
      estadoId: estadoEnProceso!.id,
    },
  });

  const evento3 = await prisma.evento.upsert({
    where: { id: 3 },
    update: {},
    create: {
      usuarioId: ciudadano.id,
      desagueId: desague2.id,
      descripcion: 'Cuneta con agua estancada y mal olor en la esquina norte del sector El Vecino',
      latitud: -2.9120000,
      longitud: -79.0110000,
      prioridadId: prioridadMedia!.id,
      estadoId: estadoPendiente!.id,
    },
  });

  console.log('✔ Eventos de ejemplo cargados');

  // ── Historial de estado (evento1: pendiente → resuelto) ───────────────

  await prisma.historialEstado.upsert({
    where: { id: 1 },
    update: {},
    create: {
      eventoId: evento1.id,
      estadoAnteriorId: estadoPendiente!.id,
      estadoNuevoId: estadoResuelto!.id,
      usuarioId: tecnico.id,
    },
  });

  // ── Orden de trabajo (evento1, tecnico asignado, resultado registrado) ─

  await prisma.ordenTrabajo.upsert({
    where: { eventoId: evento1.id },
    update: {},
    create: {
      eventoId: evento1.id,
      tecnicoId: tecnico.id,
      fechaIntervencion: new Date('2026-06-20T10:00:00Z'),
      observaciones: 'Se retiró acumulación de hojas y basura. Sumidero operativo.',
      resultadoId: resultadoResuelto!.id,
    },
  });

  console.log('✔ Historial y orden de trabajo cargados');
  console.log('\nSeed completado exitosamente.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
