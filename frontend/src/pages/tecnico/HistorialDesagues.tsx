import { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Typography, Spin, Space, Input, Drawer, Timeline, Statistic, Row, Col, Badge, Empty,
} from 'antd';
import { HistoryOutlined, SearchOutlined, EnvironmentOutlined, RedoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getDesaguesConHistorial, getHistorialDesague } from '../../api/panel';
import type { DesagueHistorialResumen, HistorialDesague } from '../../types';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'orange',
  en_proceso: 'blue',
  resuelto: 'green',
};
const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
};

function fmtFecha(f: string | null): string {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HistorialDesagues() {
  const [desagues, setDesagues] = useState<DesagueHistorialResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [detalle, setDetalle] = useState<HistorialDesague | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    getDesaguesConHistorial()
      .then(setDesagues)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function abrirDetalle(id: number) {
    setDrawerOpen(true);
    setDetalleLoading(true);
    setDetalle(null);
    getHistorialDesague(id)
      .then(setDetalle)
      .catch(console.error)
      .finally(() => setDetalleLoading(false));
  }

  const filtrados = desagues.filter((d) => {
    const q = busqueda.toLowerCase();
    return (
      d.codigo.toLowerCase().includes(q) ||
      (d.nombre ?? '').toLowerCase().includes(q) ||
      (d.sector ?? '').toLowerCase().includes(q) ||
      d.direccion.toLowerCase().includes(q)
    );
  });

  const columns: ColumnsType<DesagueHistorialResumen> = [
    {
      title: 'Desagüe',
      key: 'desague',
      render: (_, d) => (
        <div>
          <Space>
            <Text strong>{d.codigo}</Text>
            {d.recurrente && (
              <Tag icon={<RedoOutlined />} color="volcano">
                Recurrente
              </Tag>
            )}
            {!d.verificado && <Tag color="default">No verificado</Tag>}
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
            {d.nombre ? `${d.nombre} · ` : ''}{d.direccion}
          </Text>
        </div>
      ),
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      width: 140,
      render: (s: string | null) => s ?? <Text type="secondary">—</Text>,
    },
    {
      title: 'Reportes',
      dataIndex: 'totalReportes',
      width: 110,
      sorter: (a, b) => a.totalReportes - b.totalReportes,
      defaultSortOrder: 'descend',
      render: (t: number, d) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: d.recurrente ? '#d4380d' : PRIMARY }}>{t}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{d.resueltos} resueltos</Text>
        </Space>
      ),
    },
    {
      title: 'Último reporte',
      dataIndex: 'ultimoReporte',
      width: 140,
      render: (f: string | null) => <Text style={{ fontSize: 13 }}>{fmtFecha(f)}</Text>,
    },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 4 }}>
        <HistoryOutlined /> Historial por Desagüe
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Consulta si un desagüe es un punto recurrente de obstrucción. Haz clic en una fila para ver su historial completo.
      </Text>

      <Card style={{ borderRadius: 8 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Buscar por código, nombre, sector o dirección…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 380, marginBottom: 16 }}
        />
        <Table
          dataSource={filtrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (t) => `${t} desagües` }}
          onRow={(d) => ({ onClick: () => abrirDetalle(d.id), style: { cursor: 'pointer' } })}
        />
      </Card>

      <Drawer
        title={detalle ? `Historial · ${detalle.desague.codigo}` : 'Historial del desagüe'}
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {detalleLoading || !detalle ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
        ) : (
          <>
            <Space direction="vertical" size={2} style={{ marginBottom: 16 }}>
              {detalle.desague.nombre && <Text strong>{detalle.desague.nombre}</Text>}
              <Text type="secondary">
                <EnvironmentOutlined /> {detalle.desague.direccion}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {detalle.desague.sector?.nombre ?? 'Sin sector'} ·{' '}
                {detalle.desague.tipoDesague?.nombre ?? 'tipo desconocido'}
              </Text>
            </Space>

            <Row gutter={12} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Reportes" value={detalle.totalReportes} valueStyle={{ fontSize: 20, color: PRIMARY }} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Resueltos" value={detalle.resueltos} valueStyle={{ fontSize: 20, color: '#2e7d32' }} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }}>
                  <Statistic
                    title="Frec./mes"
                    value={detalle.frecuenciaMensual}
                    valueStyle={{ fontSize: 20, color: '#f57c00' }}
                  />
                </Card>
              </Col>
            </Row>

            {detalle.recurrente && (
              <Badge.Ribbon text="Punto recurrente" color="volcano">
                <Card size="small" style={{ marginBottom: 20, borderRadius: 8, background: '#fff2e8' }}>
                  <Text style={{ fontSize: 13 }}>
                    Este desagüe se ha obstruido <Text strong>{detalle.totalReportes} veces</Text>. Considérese para
                    mantenimiento preventivo prioritario.
                  </Text>
                </Card>
              </Badge.Ribbon>
            )}

            <Text strong style={{ display: 'block', marginBottom: 12 }}>Cronología de reportes</Text>
            {detalle.reportes.length === 0 ? (
              <Empty description="Sin reportes" />
            ) : (
              <Timeline
                items={detalle.reportes.map((r) => ({
                  color:
                    r.estado.nombre === 'resuelto'
                      ? 'green'
                      : r.estado.nombre === 'en_proceso'
                        ? 'blue'
                        : 'orange',
                  children: (
                    <div>
                      <Space size={6} wrap>
                        <Text strong>#{r.id}</Text>
                        <Tag color={ESTADO_COLOR[r.estado.nombre]}>{ESTADO_LABEL[r.estado.nombre] ?? r.estado.nombre}</Tag>
                        <Tag color={r.prioridad.nombre === 'alta' ? 'red' : r.prioridad.nombre === 'media' ? 'orange' : 'green'}>
                          {r.prioridad.nombre}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                        {new Date(r.fechaEvento).toLocaleString('es-EC')}
                        {r.usuario ? ` · ${r.usuario.nombre} ${r.usuario.apellido}` : ''}
                      </Text>
                      {r.descripcion && (
                        <Text style={{ display: 'block', fontSize: 13, marginTop: 4 }}>{r.descripcion}</Text>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
