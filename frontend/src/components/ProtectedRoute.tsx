import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

function getRoleHome(role: string) {
  if (role === 'ciudadano') return '/ciudadano/mis-reportes';
  if (role === 'tecnico') return '/tecnico/dashboard';
  return '/admin/estadisticas';
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { usuario, isAuthenticated, loading } = useAuth();

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && usuario && !roles.includes(usuario.tipoUsuario)) {
    return <Navigate to={getRoleHome(usuario.tipoUsuario)} replace />;
  }

  return <>{children}</>;
}
