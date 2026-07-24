import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Statistic, Row, Col, Progress, Spin, Space } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRankingSectores } from '../../api/panel';
import type { RankingSector } from '../../types';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

function efectividadColor(pct: number): string {
  if (pct >= 75) return '#2e7d32';
  if (pct >= 50) return '#f9a825';
  if (pct >= 25) return '#f57c00';
  return '#c62828';
}

const MEDALLAS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function RankingSectores() {
  const [ranking, setRanking] = useState<RankingSector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRankingSectores()
      .then(setRanking)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalResueltos = ranking.reduce((acc, s) => acc + s.resueltos, 0);
  const totalReportes = ranking.reduce((acc, s) => acc + s.total, 0);
  const efectividadGlobal = totalReportes > 0 ? Math.round((totalResueltos / totalReportes) * 100) : 0;

  const columns: ColumnsType<RankingSector> = [
    {
      title: 'Puesto',
      key: 'pos',
      width: 80,
      render: (_, __, index) => (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: MEDALLAS[index] ?? '#e0e0e0',
            color: index < 3 ? '#5a4500' : '#555',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: 'Sector',
      dataIndex: 'nombre',
      render: (nombre: string) => <Text strong>{nombre}</Text>,
    },
    {
      title: 'Resueltos',
      dataIndex: 'resueltos',
      width: 120,
      sorter: (a, b) => a.resueltos - b.resueltos,
      render: (r: number, row) => (
        <Text strong style={{ color: PRIMARY }}>
          {r} <Text type="secondary" style={{ fontWeight: 400 }}>/ {row.total}</Text>
        </Text>
      ),
    },
    {
      title: 'Pendientes',
      dataIndex: 'pendientes',
      width: 110,
      render: (p: number) => (p > 0 ? <Tag color="orange">{p}</Tag> : <Text type="secondary">0</Text>),
    },
    {
      title: 'Efectividad',
      dataIndex: 'efectividad',
      width: 220,
      sorter: (a, b) => a.efectividad - b.efectividad,
      render: (pct: number) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong style={{ color: efectividadColor(pct) }}>{pct}%</Text>
          <Progress percent={pct} strokeColor={efectividadColor(pct)} showInfo={false} size="small" />
        </Space>
      ),
    },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 4 }}>
        <TrophyOutlined style={{ color: '#FFD700' }} /> Ranking de Sectores
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Sectores ordenados por reportes resueltos y efectividad de gestión de ETAPA EP.
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: `4px solid ${PRIMARY}` }}>
            <Statistic title="Sector líder" value={ranking[0]?.nombre ?? '—'} valueStyle={{ color: PRIMARY, fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #2e7d32' }}>
            <Statistic title="Total resueltos" value={totalResueltos} valueStyle={{ color: '#2e7d32' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: `4px solid ${efectividadColor(efectividadGlobal)}` }}>
            <Statistic
              title="Efectividad global"
              value={efectividadGlobal}
              suffix="%"
              valueStyle={{ color: efectividadColor(efectividadGlobal) }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 8 }}>
        {ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Aún no hay reportes registrados por sector.</Text>
          </div>
        ) : (
          <Table dataSource={ranking} columns={columns} rowKey="sectorId" pagination={false} />
        )}
      </Card>
    </div>
  );
}
