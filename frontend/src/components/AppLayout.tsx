import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Typography, Space, Dropdown } from 'antd';
import {
  DashboardOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const PRIMARY = '#1B5E20';
const PRIMARY_LIGHT = '#2e7d32';

function getMenuItems(rol: string) {
  if (rol === 'ciudadano') {
    return [
      { key: '/ciudadano/crear-evento', icon: <FileAddOutlined />, label: 'Crear Reporte' },
      { key: '/ciudadano/mis-reportes', icon: <UnorderedListOutlined />, label: 'Mis Reportes' },
    ];
  }
  if (rol === 'tecnico') {
    return [
      { key: '/tecnico/dashboard', icon: <DashboardOutlined />, label: 'Mapa en Vivo' },
      { key: '/tecnico/eventos', icon: <UnorderedListOutlined />, label: 'Eventos' },
      { key: '/tecnico/sectores', icon: <AlertOutlined />, label: 'Sectores Críticos' },
    ];
  }
  // admin
  return [
    { key: '/admin/estadisticas', icon: <BarChartOutlined />, label: 'Estadísticas' },
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Mapa en Vivo' },
    { key: '/admin/eventos', icon: <UnorderedListOutlined />, label: 'Eventos' },
    { key: '/admin/sectores', icon: <AlertOutlined />, label: 'Sectores Críticos' },
    { key: '/admin/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
  ];
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rol = usuario?.tipoUsuario ?? 'ciudadano';
  const menuItems = getMenuItems(rol);

  const rolLabel: Record<string, string> = {
    ciudadano: 'Ciudadano',
    tecnico: 'Técnico ETAPA EP',
    admin: 'Administrador',
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar sesión',
      onClick: () => { logout(); navigate('/login'); },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{ background: PRIMARY }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 16px',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}>
          <EnvironmentOutlined style={{ color: '#fff', fontSize: 22, flexShrink: 0 }} />
          {!collapsed && (
            <Text style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
              Sistema Desagüe<br />
              <span style={{ fontWeight: 400, fontSize: 11, opacity: 0.85 }}>Cuenca · ETAPA EP</span>
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: PRIMARY, borderRight: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18, color: PRIMARY }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ background: PRIMARY_LIGHT }}>
                {usuario?.nombre?.[0]?.toUpperCase()}
              </Avatar>
              <Space direction="vertical" size={0}>
                <Text strong style={{ fontSize: 13 }}>
                  {usuario?.nombre} {usuario?.apellido}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {rolLabel[rol]}
                </Text>
              </Space>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
