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

export async function subirFoto(eventoId: number, foto: File) {
  const formData = new FormData();
  formData.append('foto', foto);
  formData.append('eventoId', String(eventoId));
  const res = await api.post('/fotos-evidencia', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getDesagues() {
  const res = await api.get('/desagues');
  return res.data;
}
