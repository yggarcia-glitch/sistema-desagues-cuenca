import { useState, useEffect, useMemo } from 'react';
import {
  Card, Table, Tag, Typography, Button, Modal, Form,
  Input, Select, Space, App, Avatar, Tabs, Badge,
} from 'antd';
import { PlusOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUsuarios } from '../../api/panel';
import api from '../../api/axiosClient';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

interface UsuarioRow {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  tipoUsuario: { id: number; nombre: string };
  fechaRegistro: string;
}

const ROL_COLOR: Record<string, string> = {
  admin: 'red',
  tecnico: 'blue',
  ciudadano: 'green',
};

const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  ciudadano: 'Ciudadano',
};

const columns: ColumnsType<UsuarioRow> = [
  {
    title: 'Usuario',
    key: 'usuario',
    render: (_, r) => (
      <Space>
        <Avatar style={{ background: PRIMARY }}>{r.nombre[0].toUpperCase()}</Avatar>
        <div>
          <Text strong>{r.nombre} {r.apellido}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{r.correo}</Text>
        </div>
      </Space>
    ),
  },
  {
    title: 'Teléfono',
    dataIndex: 'telefono',
    width: 140,
    render: (t?: string) => t ?? <Text type="secondary">—</Text>,
  },
  {
    title: 'Rol',
    key: 'rol',
    width: 120,
    render: (_, r) => (
      <Tag color={ROL_COLOR[r.tipoUsuario.nombre]}>
        {ROL_LABEL[r.tipoUsuario.nombre] ?? r.tipoUsuario.nombre}
      </Tag>
    ),
  },
  {
    title: 'Registrado',
    dataIndex: 'fechaRegistro',
    width: 150,
    render: (f: string) => new Date(f).toLocaleDateString('es-EC'),
  },
];

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState('todos');
  const [form] = Form.useForm();
  const { message } = App.useApp();

  async function cargar() {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch {
      message.error('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function onFinish(values: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    contrasena: string;
    tipoUsuario: string;
  }) {
    setSaving(true);
    try {
      await api.post('/usuarios', values);
      message.success('Usuario creado correctamente.');
      setModalOpen(false);
      form.resetFields();
      cargar();
    } catch (e: any) {
      const msg = e.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join(' · ') : msg ?? 'Error al crear usuario.');
    } finally {
      setSaving(false);
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return usuarios.filter((u) => {
      const matchRol = tabActiva === 'todos' || u.tipoUsuario.nombre === tabActiva;
      if (!q) return matchRol;
      const matchBusqueda =
        u.nombre.toLowerCase().includes(q) ||
        u.apellido.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q);
      return matchRol && matchBusqueda;
    });
  }, [usuarios, tabActiva, busqueda]);

  function contarPor(rol: string) {
    return usuarios.filter((u) => u.tipoUsuario.nombre === rol).length;
  }

  const tabItems = [
    { key: 'todos', label: <Badge count={usuarios.length} color="#888" offset={[10, 0]}>Todos</Badge> },
    { key: 'admin', label: <Badge count={contarPor('admin')} color="red" offset={[10, 0]}>Admins</Badge> },
    { key: 'tecnico', label: <Badge count={contarPor('tecnico')} color="blue" offset={[10, 0]}>Técnicos</Badge> },
    { key: 'ciudadano', label: <Badge count={contarPor('ciudadano')} color="green" offset={[10, 0]}>Ciudadanos</Badge> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ color: PRIMARY, margin: 0 }}>
            <UserOutlined /> Gestión de Usuarios
          </Title>
          <Text type="secondary">{usuarios.length} usuarios registrados en el sistema</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ background: PRIMARY, borderColor: PRIMARY }}
        >
          Nuevo técnico / admin
        </Button>
      </div>

      <Card style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
          <Tabs
            activeKey={tabActiva}
            onChange={(k) => { setTabActiva(k); setBusqueda(''); }}
            items={tabItems}
            style={{ marginBottom: 0 }}
          />
          <Input
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            placeholder="Buscar por nombre o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
        </div>

        <Table
          dataSource={filtrados}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} resultados` }}
          scroll={{ x: 600 }}
          locale={{ emptyText: busqueda ? 'Sin resultados para esa búsqueda' : 'Sin usuarios en esta categoría' }}
        />
      </Card>

      <Modal
        title="Crear usuario técnico o administrador"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Crear"
        cancelText="Cancelar"
        okButtonProps={{ style: { background: PRIMARY, borderColor: PRIMARY } }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
              <Input placeholder="María" />
            </Form.Item>
            <Form.Item name="apellido" label="Apellido" rules={[{ required: true, message: 'Requerido' }]}>
              <Input placeholder="Técnica" />
            </Form.Item>
          </div>

          <Form.Item
            name="correo"
            label="Correo"
            rules={[{ required: true, message: 'Requerido' }, { type: 'email', message: 'Correo inválido' }]}
          >
            <Input placeholder="usuario@etapa.com" />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono (opcional)">
            <Input placeholder="0991234567" />
          </Form.Item>

          <Form.Item
            name="contrasena"
            label="Contraseña"
            rules={[
              { required: true, message: 'Requerido' },
              { min: 8, message: 'Mínimo 8 caracteres' },
              { pattern: /[A-Z]/, message: 'Debe contener al menos una mayúscula' },
              { pattern: /[0-9]/, message: 'Debe contener al menos un número' },
            ]}
          >
            <Input.Password placeholder="Mín. 8 chars, una mayúscula y un número" />
          </Form.Item>

          <Form.Item
            name="tipoUsuario"
            label="Rol"
            rules={[{ required: true, message: 'Selecciona un rol' }]}
          >
            <Select placeholder="Selecciona el rol">
              <Select.Option value="tecnico">
                <Tag color="blue">TÉCNICO</Tag> — Acceso al panel de gestión
              </Select.Option>
              <Select.Option value="admin">
                <Tag color="red">ADMIN</Tag> — Acceso total al sistema
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
