import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Typography, Dropdown, Drawer, Grid } from 'antd';
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
const { useBreakpoint } = Grid;

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
  return [
    { key: '/admin/estadisticas', icon: <BarChartOutlined />, label: 'Estadísticas' },
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Mapa en Vivo' },
    { key: '/admin/eventos', icon: <UnorderedListOutlined />, label: 'Eventos' },
    { key: '/admin/sectores', icon: <AlertOutlined />, label: 'Sectores Críticos' },
    { key: '/admin/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
  ];
}

function SidebarContent({ rol, collapsed, onNavigate }: {
  rol: string;
  collapsed: boolean;
  onNavigate: (key: string) => void;
}) {
  const location = useLocation();
  const menuItems = getMenuItems(rol);

  return (
    <>
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 16px',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
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
        onClick={({ key }) => onNavigate(key)}
        style={{ background: PRIMARY, borderRight: 'none', marginTop: 8 }}
      />
    </>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const rol = usuario?.tipoUsuario ?? 'ciudadano';

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

  function handleNavigate(key: string) {
    navigate(key);
    if (isMobile) setDrawerOpen(false);
  }

  const contentPadding = isMobile ? 12 : 24;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar desktop */}
      {!isMobile && (
        <Sider
          collapsed={collapsed}
          trigger={null}
          width={220}
          collapsedWidth={64}
          style={{ background: PRIMARY, position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
        >
          <SidebarContent rol={rol} collapsed={collapsed} onNavigate={handleNavigate} />
        </Sider>
      )}

      {/* Drawer mobile */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={220}
          styles={{
            body: { padding: 0, background: PRIMARY },
            header: { display: 'none' },
          }}
        >
          <SidebarContent rol={rol} collapsed={false} onNavigate={handleNavigate} />
        </Drawer>
      )}

      <Layout>
        <Header style={{
          background: '#fff',
          padding: `0 ${contentPadding}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Button
            type="text"
            icon={isMobile
              ? <MenuUnfoldOutlined />
              : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)}
            style={{ fontSize: 18, color: PRIMARY }}
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar style={{ background: PRIMARY_LIGHT, flexShrink: 0 }}>
                {usuario?.nombre?.[0]?.toUpperCase()}
              </Avatar>
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                  <Text strong style={{ fontSize: 13 }}>
                    {usuario?.nombre} {usuario?.apellido}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {rolLabel[rol]}
                  </Text>
                </div>
              )}
            </div>
          </Dropdown>
        </Header>

        <Content style={{
          margin: contentPadding,
          background: '#f5f5f5',
          minHeight: `calc(100vh - ${64 + contentPadding * 2}px)`,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
