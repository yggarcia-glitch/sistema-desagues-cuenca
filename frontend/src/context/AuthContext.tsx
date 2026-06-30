import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  doLogin: (usuario: Usuario, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');
    if (savedToken && savedUsuario) {
      try {
        setToken(savedToken);
        setUsuario(JSON.parse(savedUsuario));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  const doLogin = (user: Usuario, tok: string) => {
    setUsuario(user);
    setToken(tok);
    localStorage.setItem('token', tok);
    localStorage.setItem('usuario', JSON.stringify(user));
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, doLogin, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
