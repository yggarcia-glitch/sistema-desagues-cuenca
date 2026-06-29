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
    direccion: string;
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
  desague?: { sector?: { nombre: string } };
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

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  tipoUsuario: { nombre: string } | string;
  fechaRegistro: string;
}
