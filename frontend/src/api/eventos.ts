import api from './axiosClient';

export interface CreateEventoData {
  descripcion: string;
  latitud: number;
  longitud: number;
  prioridad: 'alta' | 'media' | 'baja';
}

export async function crearEvento(data: CreateEventoData) {
  const res = await api.post('/eventos', data);
  return res.data;
}

export async function getMisReportes() {
  const res = await api.get('/eventos/mis-reportes');
  return res.data;
}

export async function getEvento(id: number) {
  const res = await api.get(`/eventos/${id}`);
  return res.data;
}

export async function updateEstado(id: number, estado: string) {
  const res = await api.patch(`/eventos/${id}/estado`, { estado });
  return res.data;
}

export interface ResolverExtra {
  codigoDesague?: string;
  nombreDesague?: string;
}

// Marca un evento como resuelto. La foto de la alcantarilla limpia es obligatoria.
export async function resolverEvento(id: number, foto: File, extra?: ResolverExtra) {
  const formData = new FormData();
  formData.append('foto', foto);
  if (extra?.codigoDesague) formData.append('codigoDesague', extra.codigoDesague);
  if (extra?.nombreDesague) formData.append('nombreDesague', extra.nombreDesague);
  const res = await api.patch(`/eventos/${id}/resolver`, formData);
  return res.data;
}

export async function subirFoto(eventoId: number, foto: File) {
  const formData = new FormData();
  formData.append('foto', foto);
  formData.append('eventoId', String(eventoId));
  const res = await api.post('/fotos-evidencia', formData);
  return res.data;
}

export async function getDesagues() {
  const res = await api.get('/desagues');
  return res.data;
}

// US-14: desagües dentro de un radio (metros) desde una ubicación.
export async function getDesaguesCercanos(lat: number, lng: number, radio: number) {
  const res = await api.get('/desagues/cercanos', { params: { lat, lng, radio } });
  return res.data;
}
