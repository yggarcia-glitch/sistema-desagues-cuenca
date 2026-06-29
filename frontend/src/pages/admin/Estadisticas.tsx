import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Space } from 'antd';
import { ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { getEstadisticas } from '../../api/panel';
import type { Estadisticas } from '../../types';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#f57c00',
  en_proceso: '#1565c0',
  resuelto: '#2e7d32',
};
const PIE_FALLBACK_COLORS = ['#f57c00', '#1565c0', '#2e7d32', '#6a1b9a', '#c62828'];

export default function Estadisticas() {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEstadisticas()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;
  }

  if (!stats) {
    return <Text type="secondary">No se pudieron cargar las estadísticas.</Text>;
  }

  const pieData = stats.porEstado.map((e) => ({
    name: e.estado === 'en_proceso' ? 'En Proceso' : e.estado.charAt(0).toUpperCase() + e.estado.slice(1),
    value: e.cantidad,
    color: ESTADO_COLORS[e.estado] ?? '#888',
  }));

  const barData = stats.porSector.map((s) => ({
    sector: s.sector.length > 14 ? s.sector.slice(0, 14) + '…' : s.sector,
    sectorFull: s.sector,
    eventos: s.total,
  }));

  return (
    <div>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 20 }}>
        <BarChartOutlined /> Estadísticas Globales
      </Title>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, borderLeft: `4px solid ${PRIMARY}` }}>
            <Statistic title="Total de Eventos" value={stats.total} valueStyle={{ color: PRIMARY, fontSize: 32 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #f57c00' }}>
            <Statistic
              title="Pendientes"
              value={stats.porEstado.find((e) => e.estado === 'pendiente')?.cantidad ?? 0}
              valueStyle={{ color: '#f57c00', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #1565c0' }}>
            <Statistic
              title="En Proceso"
              value={stats.porEstado.find((e) => e.estado === 'en_proceso')?.cantidad ?? 0}
              valueStyle={{ color: '#1565c0', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #2e7d32' }}>
            <Statistic
              title="Resueltos"
              value={stats.porEstado.find((e) => e.estado === 'resuelto')?.cantidad ?? 0}
              valueStyle={{ color: '#2e7d32', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tiempo promedio */}
      {stats.tiempoPromedioResolucionHoras !== null && (
        <Card style={{ marginBottom: 24, borderRadius: 8 }}>
          <Space>
            <ClockCircleOutlined style={{ fontSize: 28, color: PRIMARY }} />
            <div>
              <Text type="secondary">Tiempo promedio de resolución</Text>
              <Title level={4} style={{ margin: 0, color: PRIMARY }}>
                {stats.tiempoPromedioResolucionHoras} horas
              </Title>
            </div>
          </Space>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {/* Pie: distribución por estado */}
        <Col xs={24} lg={10}>
          <Card title="Distribución por Estado" style={{ borderRadius: 8 }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color ?? PIE_FALLBACK_COLORS[index % PIE_FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} eventos`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Bar: eventos por sector */}
        <Col xs={24} lg={14}>
          <Card title="Eventos por Sector" style={{ borderRadius: 8 }}>
            {barData.length === 0 ? (
              <Text type="secondary">Sin datos de sectores aún.</Text>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`${v} eventos`, 'Total']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.sectorFull ?? ''}
                  />
                  <Legend />
                  <Bar dataKey="eventos" fill={PRIMARY} name="Eventos" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
