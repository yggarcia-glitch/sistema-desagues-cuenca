import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import CrearEvento from './pages/ciudadano/CrearEvento';
import MisReportes from './pages/ciudadano/MisReportes';
import Dashboard from './pages/tecnico/Dashboard';
import ListaEventos from './pages/tecnico/ListaEventos';
import SectoresCriticos from './pages/tecnico/SectoresCriticos';
import Estadisticas from './pages/admin/Estadisticas';

function HomeRedirect() {
  const { usuario, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (usuario?.tipoUsuario === 'ciudadano') return <Navigate to="/ciudadano/mis-reportes" replace />;
  if (usuario?.tipoUsuario === 'tecnico') return <Navigate to="/tecnico/dashboard" replace />;
  return <Navigate to="/admin/estadisticas" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Ciudadano */}
      <Route
        path="/ciudadano"
        element={
          <ProtectedRoute roles={['ciudadano']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="crear-evento" element={<CrearEvento />} />
        <Route path="mis-reportes" element={<MisReportes />} />
        <Route index element={<Navigate to="mis-reportes" replace />} />
      </Route>

      {/* Técnico */}
      <Route
        path="/tecnico"
        element={
          <ProtectedRoute roles={['tecnico', 'admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="eventos" element={<ListaEventos />} />
        <Route path="sectores" element={<SectoresCriticos />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="estadisticas" element={<Estadisticas />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="eventos" element={<ListaEventos />} />
        <Route path="sectores" element={<SectoresCriticos />} />
        <Route index element={<Navigate to="estadisticas" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
