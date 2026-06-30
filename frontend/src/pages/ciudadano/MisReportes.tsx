import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Empty, Button, Space, Spin, Alert } from 'antd';
import { FileAddOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getMisReportes } from '../../api/eventos';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

interface Reporte {
  id: number;
  descripcion: string;
  prioridad: { nombre: string };
  estado: { nombre: string };
  fechaEvento: string;
  latitud: number;
  longitud: number;
}

const PRIORIDAD_COLOR: Record<string, string> = { alta: 'red', media: 'orange', baja: 'green' };
const ESTADO_COLOR: Record<string, string> = { pendiente: 'default', en_proceso: 'blue', resuelto: 'green' };
const ESTADO_LABEL: Record<string, string> = { pendiente: 'Pendiente', en_proceso: 'En Proceso', resuelto: 'Resuelto' };

export default function MisReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function cargar() {
    setLoading(true);
    setError('');
    try {
      const data = await getMisReportes();
      setReportes(data);
    } catch {
      setError('No se pudieron cargar los reportes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const columns: ColumnsType<Reporte> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 70,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      ellipsis: true,
    },
    {
      title: 'Prioridad',
      dataIndex: 'prioridad',
      width: 110,
      render: (p: { nombre: string }) => (
        <Tag color={PRIORIDAD_COLOR[p.nombre]}>{p.nombre.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 130,
      render: (e: { nombre: string }) => (
        <Tag color={ESTADO_COLOR[e.nombre]}>{ESTADO_LABEL[e.nombre] ?? e.nombre}</Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaEvento',
      width: 160,
      render: (f: string) => new Date(f).toLocaleString('es-EC'),
    },
    {
      title: 'Ubicación',
      key: 'ubicacion',
      width: 160,
      render: (_: unknown, r: Reporte) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {Number(r.latitud).toFixed(5)}, {Number(r.longitud).toFixed(5)}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ color: PRIMARY, margin: 0 }}>Mis Reportes</Title>
          <Text type="secondary">Historial de desagües obstruidos que has reportado</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={cargar} loading={loading}>Actualizar</Button>
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={() => navigate('/ciudadano/crear-evento')}
            style={{ background: PRIMARY, borderColor: PRIMARY }}
          >
            Nuevo Reporte
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 8 }}>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {loading ? (
          <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: 40 }} />
        ) : reportes.length === 0 ? (
          <Empty description={<Text>Aún no tienes reportes registrados</Text>}>
            <Button
              type="primary"
              onClick={() => navigate('/ciudadano/crear-evento')}
              style={{ background: PRIMARY, borderColor: PRIMARY }}
            >
              Crear primer reporte
            </Button>
          </Empty>
        ) : (
          <Table
            dataSource={reportes}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
}
