export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipoUsuario: string;
}

export interface Evento {
  id: number;
  descripcion: string;
  latitud: number;
  longitud: number;
  fechaEvento: string;
  usuarioId?: number;
  usuario?: { id: number; nombre: string; apellido: string };
  desague?: {
    id: number;
    codigo: string;
    nombre?: string | null;
    direccion: string;
    verificado?: boolean;
    tipoDesague?: { nombre: string };
    sector?: { id: number; nombre: string };
  };
  prioridad?: { id: number; nombre: string };
  estado?: { id: number; nombre: string };
  fotos?: { urlImagen: string }[];
  orden?: { id: number; fechaAsignacion: string; resultado?: { nombre: string } } | null;
}

export interface EventoMapa {
  id: number;
  latitud: number;
  longitud: number;
  estado: { nombre: string };
  prioridad: { nombre: string };
  descripcion: string;
  fotos?: { urlImagen: string }[];
  desague?: {
    id: number;
    codigo: string;
    nombre?: string | null;
    verificado: boolean;
    sector?: { nombre: string };
  };
}

export interface Estadisticas {
  total: number;
  porEstado: { estado: string; cantidad: number }[];
  porSector: { sector: string; total: number }[];
  tiempoPromedioResolucionHoras: number | null;
}

export interface SectorCritico {
  sectorId: number;
  nombre: string;
  descripcion: string;
  eventosPendientes: number;
}

export interface Desague {
  id: number;
  codigo: string;
  direccion: string;
  sector?: { nombre: string };
}

// US-18
export interface RankingSector {
  sectorId: number;
  nombre: string;
  total: number;
  resueltos: number;
  pendientes: number;
  enProceso: number;
  efectividad: number;
}

// US-13
export interface DesagueHistorialResumen {
  id: number;
  codigo: string;
  nombre?: string | null;
  direccion: string;
  verificado: boolean;
  sector?: string | null;
  totalReportes: number;
  resueltos: number;
  recurrente: boolean;
  ultimoReporte: string | null;
}

export interface HistorialDesague {
  desague: {
    id: number;
    codigo: string;
    nombre?: string | null;
    direccion: string;
    verificado: boolean;
    latitud: number;
    longitud: number;
    sector?: { id: number; nombre: string } | null;
    tipoDesague?: { nombre: string } | null;
  };
  totalReportes: number;
  resueltos: number;
  recurrente: boolean;
  frecuenciaMensual: number;
  reportes: {
    id: number;
    descripcion: string;
    fechaEvento: string;
    usuario?: { nombre: string; apellido: string };
    prioridad: { nombre: string };
    estado: { nombre: string };
  }[];
}

// US-14
export interface DesagueCercano {
  id: number;
  codigo: string;
  nombre?: string | null;
  direccion: string;
  latitud: number;
  longitud: number;
  verificado: boolean;
  distancia: number;
  tipoDesague?: { id: number; nombre: string } | null;
  sector?: { id: number; nombre: string } | null;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  tipoUsuario: { nombre: string } | string;
  fechaRegistro: string;
}
