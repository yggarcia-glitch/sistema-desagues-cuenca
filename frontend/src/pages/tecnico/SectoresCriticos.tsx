import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Statistic, Row, Col, Progress, Spin, Space } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getSectoresCriticos } from '../../api/panel';
import type { SectorCritico } from '../../types';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

function getNivelCriticidad(pendientes: number): { color: string; label: string; percent: number } {
  if (pendientes >= 10) return { color: '#c62828', label: 'CRÍTICO', percent: 100 };
  if (pendientes >= 5) return { color: '#f57c00', label: 'ALTO', percent: 70 };
  if (pendientes >= 2) return { color: '#f9a825', label: 'MEDIO', percent: 40 };
  return { color: PRIMARY, label: 'BAJO', percent: 15 };
}

export default function SectoresCriticos() {
  const [sectores, setSectores] = useState<SectorCritico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSectoresCriticos()
      .then(setSectores)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPendientes = sectores.reduce((acc, s) => acc + s.eventosPendientes, 0);
  const maxPendientes = sectores[0]?.eventosPendientes ?? 1;

  const columns: ColumnsType<SectorCritico> = [
    {
      title: 'Posición',
      key: 'pos',
      width: 80,
      render: (_, __, index) => {
        const colors = ['#c62828', '#f57c00', '#f9a825'];
        return (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: colors[index] ?? '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {index + 1}
          </div>
        );
      },
    },
    {
      title: 'Sector',
      dataIndex: 'nombre',
      render: (nombre: string, r) => (
        <div>
          <Text strong>{nombre}</Text>
          {r.descripcion && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{r.descripcion}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Nivel',
      key: 'nivel',
      width: 110,
      render: (_, r) => {
        const n = getNivelCriticidad(r.eventosPendientes);
        return <Tag color={n.color === '#c62828' ? 'red' : n.color === '#f57c00' ? 'orange' : n.color === '#f9a825' ? 'gold' : 'green'}>{n.label}</Tag>;
      },
    },
    {
      title: 'Eventos pendientes',
      dataIndex: 'eventosPendientes',
      width: 200,
      render: (p: number) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong style={{ color: '#c62828' }}>{p} {p === 1 ? 'evento' : 'eventos'}</Text>
          <Progress
            percent={Math.round((p / maxPendientes) * 100)}
            strokeColor="#c62828"
            showInfo={false}
            size="small"
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 20 }}>
        <AlertOutlined style={{ color: '#c62828' }} /> Sectores Críticos
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #c62828' }}>
            <Statistic
              title="Sectores con eventos pendientes"
              value={sectores.length}
              valueStyle={{ color: '#c62828' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #f57c00' }}>
            <Statistic
              title="Total eventos pendientes"
              value={totalPendientes}
              valueStyle={{ color: '#f57c00' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: `4px solid ${PRIMARY}` }}>
            <Statistic
              title="Sector más crítico"
              value={sectores[0]?.nombre ?? '—'}
              valueStyle={{ color: PRIMARY, fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 8 }}>
        {sectores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No hay sectores con eventos pendientes. ¡Todo está bajo control!</Text>
          </div>
        ) : (
          <Table
            dataSource={sectores}
            columns={columns}
            rowKey="sectorId"
            pagination={false}
          />
        )}
      </Card>
    </div>
  );
}

