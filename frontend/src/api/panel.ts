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

export async function getEventosCriticos() {
  const res = await api.get('/panel/eventos/criticos');
  return res.data;
}

export async function getUsuarios() {
  const res = await api.get('/usuarios');
  return res.data;
}

// US-18
export async function getRankingSectores() {
  const res = await api.get('/panel/sectores/ranking');
  return res.data;
}

// US-13
export async function getDesaguesConHistorial() {
  const res = await api.get('/panel/desagues/historial');
  return res.data;
}

export async function getHistorialDesague(id: number) {
  const res = await api.get(`/panel/desagues/${id}/historial`);
  return res.data;
}

// US-15: descarga el CSV histórico (con filtro opcional de fechas).
export async function exportarReportesCsv(desde?: string, hasta?: string) {
  const params: Record<string, string> = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const res = await api.get('/panel/export/csv', { params, responseType: 'blob' });

  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reportes_desagues_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
