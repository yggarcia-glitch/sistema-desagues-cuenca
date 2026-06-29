import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Empty, Button, Space } from 'antd';
import { FileAddOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

interface ReporteLocal {
  id: number;
  descripcion: string;
  prioridad: string;
  estado: string;
  fechaEvento: string;
  latitud: number;
  longitud: number;
}

const PRIORIDAD_COLOR: Record<string, string> = { alta: 'red', media: 'orange', baja: 'green' };
const ESTADO_COLOR: Record<string, string> = { pendiente: 'default', en_proceso: 'blue', resuelto: 'green' };
const ESTADO_LABEL: Record<string, string> = { pendiente: 'Pendiente', en_proceso: 'En Proceso', resuelto: 'Resuelto' };

export default function MisReportes() {
  const [reportes, setReportes] = useState<ReporteLocal[]>([]);
  const navigate = useNavigate();

  function cargar() {
    try {
      const stored = JSON.parse(localStorage.getItem('mis_reportes') ?? '[]');
      setReportes(stored);
    } catch {
      setReportes([]);
    }
  }

  useEffect(() => { cargar(); }, []);

  const columns: ColumnsType<ReporteLocal> = [
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
      render: (desc: string) => <Text>{desc}</Text>,
    },
    {
      title: 'Prioridad',
      dataIndex: 'prioridad',
      width: 110,
      render: (p: string) => (
        <Tag color={PRIORIDAD_COLOR[p]}>{p.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 130,
      render: (e: string) => (
        <Tag color={ESTADO_COLOR[e]}>{ESTADO_LABEL[e] ?? e}</Tag>
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
      render: (_, r) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {r.latitud.toFixed(5)}, {r.longitud.toFixed(5)}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ color: PRIMARY, margin: 0 }}>Mis Reportes</Title>
          <Text type="secondary">Historial de desagüesobstruidos que has reportado</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={cargar}>Actualizar</Button>
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
        {reportes.length === 0 ? (
          <Empty
            description={
              <Space direction="vertical" size={4}>
                <Text>Aún no tienes reportes registrados</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Los reportes aparecen aquí cuando los creas desde este dispositivo.
                </Text>
              </Space>
            }
          >
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
