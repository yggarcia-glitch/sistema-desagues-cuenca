import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Typography, Spin, Space, Table, Tag, Progress, Badge,
  DatePicker, Button, App,
} from 'antd';
import {
  ClockCircleOutlined, BarChartOutlined, WarningOutlined, DownloadOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { getEstadisticas, getEventosCriticos, exportarReportesCsv } from '../../api/panel';
import type { Estadisticas } from '../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const PRIMARY = '#1B5E20';

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#f57c00',
  en_proceso: '#1565c0',
  resuelto: '#2e7d32',
};
const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
};
const PIE_FALLBACK_COLORS = ['#f57c00', '#1565c0', '#2e7d32', '#6a1b9a', '#c62828'];

const LIMITE_HORAS: Record<string, number> = { alta: 24, media: 48, baja: 72 };

interface EventoCritico {
  id: number;
  descripcion: string;
  fechaEvento: string;
  prioridad: { nombre: string };
  estado: { nombre: string };
  usuario?: { nombre: string; apellido: string };
  desague?: { sector?: { nombre: string } };
}

function horasTranscurridas(fecha: string): number {
  return (Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60);
}

function formatHoras(horas: number): string {
  if (horas < 1) return 'Menos de 1 h';
  if (horas < 24) return `${Math.floor(horas)} h ${Math.round((horas % 1) * 60)} min`;
  const dias = Math.floor(horas / 24);
  const h = Math.round(horas % 24);
  return h > 0 ? `${dias} d ${h} h` : `${dias} d`;
}

function formatPromedioHoras(horas: number): string {
  if (horas < 1) return 'Menos de 1 hora';
  if (horas < 24) return `${horas.toFixed(1)} h`;
  const dias = Math.floor(horas / 24);
  const h = Math.round(horas % 24);
  return h > 0 ? `${dias} d ${h} h` : `${dias} d`;
}

export default function Estadisticas() {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [criticos, setCriticos] = useState<EventoCritico[]>([]);
  const [loading, setLoading] = useState(true);
  const [rango, setRango] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [exportando, setExportando] = useState(false);
  const { message } = App.useApp();

  async function handleExportCsv() {
    setExportando(true);
    try {
      const desde = rango?.[0]?.format('YYYY-MM-DD');
      const hasta = rango?.[1]?.format('YYYY-MM-DD');
      await exportarReportesCsv(desde, hasta);
      message.success('CSV generado. Revisa tus descargas.');
    } catch {
      message.error('No se pudo generar el CSV.');
    } finally {
      setExportando(false);
    }
  }

  useEffect(() => {
    Promise.all([getEstadisticas(), getEventosCriticos()])
      .then(([s, c]) => { setStats(s); setCriticos(c); })
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
    name: ESTADO_LABEL[e.estado] ?? e.estado,
    value: e.cantidad,
    color: ESTADO_COLORS[e.estado] ?? '#888',
  }));

  const barData = stats.porSector.map((s) => ({
    sector: s.sector.length > 14 ? s.sector.slice(0, 14) + '…' : s.sector,
    sectorFull: s.sector,
    eventos: s.total,
  }));

  const columnasCriticos: ColumnsType<EventoCritico> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 60,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Ciudadano',
      key: 'usuario',
      width: 140,
      render: (_, r) => r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : '—',
    },
    {
      title: 'Sector',
      key: 'sector',
      width: 120,
      render: (_, r) => r.desague?.sector?.nombre ?? '—',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      ellipsis: true,
      render: (d: string) => d || <Text type="secondary">Sin descripción</Text>,
    },
    {
      title: 'Prioridad',
      key: 'prioridad',
      width: 100,
      render: (_, r) => (
        <Tag color={r.prioridad.nombre === 'alta' ? 'red' : 'orange'}>
          {r.prioridad.nombre.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 110,
      render: (_, r) => (
        <Tag color={ESTADO_COLORS[r.estado.nombre]}>
          {ESTADO_LABEL[r.estado.nombre] ?? r.estado.nombre}
        </Tag>
      ),
    },
    {
      title: 'Tiempo abierto',
      key: 'tiempo',
      width: 130,
      render: (_, r) => {
        const horas = horasTranscurridas(r.fechaEvento);
        const limite = LIMITE_HORAS[r.prioridad.nombre] ?? 48;
        const pct = Math.min((horas / limite) * 100, 100);
        const vencido = horas >= limite;
        const porVencer = !vencido && pct >= 50;
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text style={{ fontSize: 12 }}>{formatHoras(horas)}</Text>
            <Progress
              percent={Math.round(pct)}
              size="small"
              showInfo={false}
              strokeColor={vencido ? '#cf1322' : porVencer ? '#fa8c16' : '#52c41a'}
            />
          </Space>
        );
      },
    },
    {
      title: 'Límite',
      key: 'limite',
      width: 110,
      render: (_, r) => {
        const horas = horasTranscurridas(r.fechaEvento);
        const limite = LIMITE_HORAS[r.prioridad.nombre] ?? 48;
        const vencido = horas >= limite;
        const porVencer = !vencido && (horas / limite) >= 0.5;
        return (
          <Space direction="vertical" size={2}>
            <Text type="secondary" style={{ fontSize: 11 }}>{limite} h máx.</Text>
            {vencido
              ? <Badge status="error" text={<Text style={{ fontSize: 11, color: '#cf1322' }}>Vencido</Text>} />
              : porVencer
                ? <Badge status="warning" text={<Text style={{ fontSize: 11, color: '#fa8c16' }}>Por vencer</Text>} />
                : <Badge status="success" text={<Text style={{ fontSize: 11, color: '#52c41a' }}>A tiempo</Text>} />
            }
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 20 }}>
        <BarChartOutlined /> Estadísticas Globales
      </Title>

      {/* US-15: exportación CSV del histórico */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={0}>
            <Text strong>Exportar histórico de incidencias (CSV)</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Para integrarlo con modelos hidrológicos de planificación. Filtra por rango de fechas (opcional).
            </Text>
          </Space>
          <Space wrap>
            <RangePicker
              value={rango as any}
              onChange={(v) => setRango(v as [Dayjs | null, Dayjs | null] | null)}
              format="DD/MM/YYYY"
              allowEmpty={[true, true]}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exportando}
              onClick={handleExportCsv}
              style={{ background: PRIMARY, borderColor: PRIMARY }}
            >
              Descargar CSV
            </Button>
          </Space>
        </Space>
      </Card>

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
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Space>
          <ClockCircleOutlined style={{ fontSize: 28, color: PRIMARY }} />
          <div>
            <Text type="secondary">Tiempo promedio de resolución</Text>
            <Title level={4} style={{ margin: 0, color: PRIMARY }}>
              {stats.tiempoPromedioResolucionHoras !== null
                ? formatPromedioHoras(stats.tiempoPromedioResolucionHoras)
                : 'Sin eventos resueltos aún'}
            </Title>
          </div>
        </Space>
      </Card>

      {/* Eventos críticos */}
      <Card
        style={{ marginBottom: 24, borderRadius: 8 }}
        title={
          <Space>
            <WarningOutlined style={{ color: '#cf1322' }} />
            <span>Eventos Críticos Abiertos</span>
            <Tag color="red">{criticos.length}</Tag>
          </Space>
        }
      >
        {criticos.length === 0 ? (
          <Text type="secondary">No hay eventos críticos abiertos. ¡Todo bajo control!</Text>
        ) : (
          <Table
            dataSource={criticos}
            columns={columnasCriticos}
            rowKey="id"
            pagination={{ pageSize: 8, showTotal: (t) => `${t} eventos` }}
            scroll={{ x: 900 }}
            rowClassName={(r) => {
              const horas = horasTranscurridas(r.fechaEvento);
              const limite = LIMITE_HORAS[r.prioridad.nombre] ?? 48;
              return horas >= limite ? 'ant-table-row-danger' : '';
            }}
          />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        {/* Pie */}
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
                    <Cell key={index} fill={entry.color ?? PIE_FALLBACK_COLORS[index % PIE_FALLBACK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} eventos`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Bar */}
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
