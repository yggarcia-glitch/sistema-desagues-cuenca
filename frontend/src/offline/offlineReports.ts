// US-16: cola local de reportes creados sin conexión.
// Los reportes se guardan en localStorage y se sincronizan automáticamente
// cuando vuelve la conexión. (La foto de evidencia no se almacena offline;
// puede adjuntarse luego desde "Mis Reportes".)
import { crearEvento } from '../api/eventos';

const STORAGE_KEY = 'reportes_offline_pendientes';

export interface ReporteOffline {
  tempId: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  prioridad: 'alta' | 'media' | 'baja';
  createdAt: string;
}

type Listener = (pendientes: ReporteOffline[]) => void;
const listeners = new Set<Listener>();

export function getPendientes(): ReporteOffline[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReporteOffline[]) : [];
  } catch {
    return [];
  }
}

function guardar(pendientes: ReporteOffline[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendientes));
  listeners.forEach((l) => l(pendientes));
}

export function encolarReporte(data: Omit<ReporteOffline, 'tempId' | 'createdAt'>): ReporteOffline {
  const reporte: ReporteOffline = {
    ...data,
    tempId: `off_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  guardar([...getPendientes(), reporte]);
  return reporte;
}

/** Suscribe a cambios en la cola. Devuelve la función para desuscribirse. */
export function suscribir(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let sincronizando = false;

/**
 * Intenta enviar todos los reportes pendientes. Devuelve cuántos se
 * sincronizaron correctamente. Los que fallan permanecen en la cola.
 */
export async function sincronizar(): Promise<{ enviados: number; restantes: number }> {
  if (sincronizando) return { enviados: 0, restantes: getPendientes().length };
  if (!navigator.onLine) return { enviados: 0, restantes: getPendientes().length };

  sincronizando = true;
  let enviados = 0;
  try {
    // Se re-lee la cola en cada iteración por si cambia.
    let cola = getPendientes();
    const restantes: ReporteOffline[] = [];

    for (const r of cola) {
      try {
        await crearEvento({
          descripcion: r.descripcion,
          latitud: r.latitud,
          longitud: r.longitud,
          prioridad: r.prioridad,
        });
        enviados += 1;
      } catch {
        // Falla (sin red o error del servidor): se conserva para reintentar.
        restantes.push(r);
      }
    }

    guardar(restantes);
    return { enviados, restantes: restantes.length };
  } finally {
    sincronizando = false;
  }
}
