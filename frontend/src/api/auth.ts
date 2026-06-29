import api from './axiosClient';

export interface RegisterData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  contrasena: string;
}

export interface LoginData {
  correo: string;
  contrasena: string;
}

export async function register(data: RegisterData) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function login(data: LoginData) {
  const res = await api.post('/auth/login', data);
  return res.data;
}
