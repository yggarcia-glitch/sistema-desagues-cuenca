import api from './axiosClient';

export interface FiltrosEventos {
  estado?: string;
  prioridad?: string;
  sectorId?: number;
}

export async function getPanelEventos(filtros?: FiltrosEventos) {
  const params: Record<string, string | number> = {};
  if (filtros?.estado) params.estado = filtros.estado;
  if (filtros?.prioridad) params.prioridad = filtros.prioridad;
  if (filtros?.sectorId) params.sectorId = filtros.sectorId;
  const res = await api.get('/panel/eventos', { params });
  return res.data;
}

export async function getEventosMapa() {
  const res = await api.get('/panel/eventos/mapa');
  return res.data;
}

export async function getEstadisticas() {
  const res = await api.get('/panel/estadisticas');
  return res.data;
}

export async function getSectoresCriticos() {
  const res = await api.get('/panel/sectores/criticos');
  return res.data;
}

export async function getUsuarios() {
  const res = await api.get('/usuarios');
  return res.data;
}
