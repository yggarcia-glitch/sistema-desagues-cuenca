/**
 * Importa tapas de alcantarilla y canales de drenaje desde OpenStreetMap
 * Fuente: Overpass API — bounding box Cuenca, Ecuador (-2.95,-79.05,-2.85,-78.95)
 * Ejecutar: npx ts-node prisma/import-osm.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OSM_DESAGUES = [
  // ── Tapas de alcantarilla (man_made=manhole) ──────────────────────────
  { osmId: 'N-12289141058', lat: -2.8914947, lng: -78.9810366, tipo: 'sumidero',     dir: 'Tapa alcantarilla - zona este' },
  { osmId: 'N-12289141059', lat: -2.8915180, lng: -78.9811804, tipo: 'sumidero',     dir: 'Tapa alcantarilla - zona este' },
  { osmId: 'N-12289141060', lat: -2.8914093, lng: -78.9811546, tipo: 'sumidero',     dir: 'Tapa alcantarilla - zona este' },
  { osmId: 'N-12289354323', lat: -2.8910147, lng: -78.9813539, tipo: 'sumidero',     dir: 'Tapa alcantarilla - zona este' },
  { osmId: 'N-12289354324', lat: -2.8909664, lng: -78.9814794, tipo: 'sumidero',     dir: 'Tapa alcantarilla - zona este' },
  { osmId: 'N-12289354329', lat: -2.8908810, lng: -78.9813792, tipo: 'sumidero',     dir: 'Tapa alcantarilla (alcantarillado) - zona este' },
  { osmId: 'N-12289354330', lat: -2.8909170, lng: -78.9813603, tipo: 'sumidero',     dir: 'Tapa alcantarilla (alcantarillado) - zona este' },
  // ── Canales de drenaje (waterway=drain) ──────────────────────────────
  { osmId: 'W-171962438',   lat: -2.8748741, lng: -79.0195138, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte' },
  { osmId: 'W-171962445',   lat: -2.8556046, lng: -79.0151281, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte' },
  { osmId: 'W-227234190',   lat: -2.8574879, lng: -79.0102209, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte' },
  { osmId: 'W-242241551',   lat: -2.8589934, lng: -79.0055885, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte (revisar)' },
  { osmId: 'W-242241555',   lat: -2.8735461, lng: -79.0164355, tipo: 'alcantarilla', dir: 'Canal de drenaje subterráneo - sector norte' },
  { osmId: 'W-242241556',   lat: -2.8597258, lng: -79.0046157, tipo: 'alcantarilla', dir: 'Canal de drenaje subterráneo - sector norte' },
  { osmId: 'W-242241558',   lat: -2.8594076, lng: -79.0047595, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte' },
  { osmId: 'W-242241559',   lat: -2.8616719, lng: -79.0043741, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte' },
  { osmId: 'W-242241560',   lat: -2.8716725, lng: -79.0157930, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte' },
  { osmId: 'W-511120900',   lat: -2.8897678, lng: -79.0248777, tipo: 'alcantarilla', dir: 'Canal De los Eucaliptos' },
  { osmId: 'W-559207524',   lat: -2.8653410, lng: -79.0052300, tipo: 'alcantarilla', dir: 'Canal de drenaje - sector norte' },
  { osmId: 'W-559207527',   lat: -2.8636438, lng: -79.0051884, tipo: 'cuneta',       dir: 'Canal de drenaje en túnel - sector norte' },
];

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function main() {
  const tipos = await prisma.tipoDesague.findMany();
  const tipoMap = new Map(tipos.map(t => [t.nombre, t.id]));

  const sectores = await prisma.sector.findMany({
    include: { desagues: { select: { latitud: true, longitud: true }, take: 10 } },
  });

  function sectorMasCercano(lat: number, lng: number): number | undefined {
    let mejor: number | undefined;
    let menorDist = Infinity;
    for (const s of sectores) {
      for (const d of s.desagues) {
        const dist = distanciaMetros(lat, lng, Number(d.latitud), Number(d.longitud));
        if (dist < menorDist) { menorDist = dist; mejor = s.id; }
      }
    }
    // si el sector está a más de 5km, no asignamos
    return menorDist < 5000 ? mejor : undefined;
  }

  let insertados = 0;
  let omitidos = 0;

  for (const p of OSM_DESAGUES) {
    // Evitar duplicados por osmId en el código
    const existe = await prisma.desague.findFirst({ where: { codigo: p.osmId } });
    if (existe) { omitidos++; continue; }

    await prisma.desague.create({
      data: {
        codigo: p.osmId,
        latitud: p.lat,
        longitud: p.lng,
        direccion: p.dir,
        tipoDesagueId: tipoMap.get(p.tipo) ?? undefined,
        sectorId: sectorMasCercano(p.lat, p.lng),
        verificado: false,
        fuenteDatos: 'osm',
      },
    });
    insertados++;
  }

  console.log(`✔ OSM importado: ${insertados} insertados, ${omitidos} ya existían.`);
  console.log('  Todos marcados como verificado=false — ETAPA EP debe confirmar en campo.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
