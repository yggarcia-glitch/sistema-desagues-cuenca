import { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Tag, Typography, Select, Space, Button,
  Modal, App, Row, Col, Avatar, Image,
} from 'antd';
import { SyncOutlined, FilterOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPanelEventos } from '../../api/panel';
import { updateEstado } from '../../api/eventos';
import type { Evento } from '../../types';
import type { FiltrosEventos } from '../../api/panel';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';
const BACKEND = (import.meta.env.VITE_API_URL as string) ?? '';

function fotoUrl(urlImagen: string) {
  return `${BACKEND}/${urlImagen.replace(/\\/g, '/')}`;
}

const PRIORIDAD_COLOR: Record<string, string> = { alta: 'red', media: 'orange', baja: 'green' };
const ESTADO_COLOR: Record<string, string> = { pendiente: 'default', en_proceso: 'blue', resuelto: 'success' };
const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
};

export default function ListaEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosEventos>({});
  const [modalEvento, setModalEvento] = useState<Evento | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [savingEstado, setSavingEstado] = useState(false);
  const { message } = App.useApp();

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPanelEventos(filtros);
      setEventos(data);
    } catch {
      message.error('No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  async function cambiarEstado() {
    if (!modalEvento || !nuevoEstado) return;
    setSavingEstado(true);
    try {
      await updateEstado(modalEvento.id, nuevoEstado);
      message.success('Estado actualizado correctamente.');
      setModalEvento(null);
      cargar();
    } catch {
      message.error('No se pudo actualizar el estado.');
    } finally {
      setSavingEstado(false);
    }
  }

  const columns: ColumnsType<Evento> = [
    {
      title: '#',
      dataIndex: 'id',
      width: 60,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Ciudadano',
      key: 'usuario',
      width: 160,
      render: (_, r) => r.usuario
        ? <Space><Avatar size="small" style={{ background: PRIMARY }}>{r.usuario.nombre[0]}</Avatar>{r.usuario.nombre} {r.usuario.apellido}</Space>
        : '—',
    },
    {
      title: 'Sector',
      key: 'sector',
      width: 130,
      render: (_, r) => r.desague?.sector?.nombre ?? '—',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      ellipsis: true,
    },
    {
      title: 'Prioridad',
      key: 'prioridad',
      width: 100,
      render: (_, r) => (
        <Tag color={PRIORIDAD_COLOR[r.prioridad?.nombre ?? '']}>{r.prioridad?.nombre?.toUpperCase() ?? '—'}</Tag>
      ),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 120,
      render: (_, r) => (
        <Tag color={ESTADO_COLOR[r.estado?.nombre ?? '']}>{ESTADO_LABEL[r.estado?.nombre ?? ''] ?? r.estado?.nombre}</Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaEvento',
      width: 150,
      render: (f: string) => new Date(f).toLocaleString('es-EC'),
    },
    {
      title: 'Acción',
      key: 'accion',
      width: 110,
      render: (_, r) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<SyncOutlined />}
          onClick={() => { setModalEvento(r); setNuevoEstado(r.estado?.nombre ?? 'pendiente'); }}
        >
          Estado
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 20 }}>Gestión de Eventos</Title>

      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col>
            <FilterOutlined style={{ color: PRIMARY }} />
            <Text strong style={{ marginLeft: 8 }}>Filtros:</Text>
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="Estado"
              style={{ width: 150 }}
              onChange={(v) => setFiltros((f) => ({ ...f, estado: v }))}
              options={[
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'en_proceso', label: 'En Proceso' },
                { value: 'resuelto', label: 'Resuelto' },
              ]}
            />
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="Prioridad"
              style={{ width: 150 }}
              onChange={(v) => setFiltros((f) => ({ ...f, prioridad: v }))}
              options={[
                { value: 'alta', label: 'Alta' },
                { value: 'media', label: 'Media' },
                { value: 'baja', label: 'Baja' },
              ]}
            />
          </Col>
          <Col>
            <Button onClick={cargar} icon={<SyncOutlined />}>Actualizar</Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 8 }}>
        <Table
          dataSource={eventos}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showTotal: (t) => `${t} eventos` }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={`Cambiar estado — Evento #${modalEvento?.id}`}
        open={!!modalEvento}
        onCancel={() => setModalEvento(null)}
        onOk={cambiarEstado}
        confirmLoading={savingEstado}
        okText="Guardar"
        cancelText="Cancelar"
        okButtonProps={{ style: { background: PRIMARY, borderColor: PRIMARY } }}
      >
        {modalEvento && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">{modalEvento.descripcion}</Text>

            {modalEvento.fotos && modalEvento.fotos.length > 0 && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Fotos de evidencia ({modalEvento.fotos.length})
                </Text>
                <Image.PreviewGroup>
                  <Space wrap>
                    {modalEvento.fotos.map((f, i) => (
                      <Image
                        key={i}
                        src={fotoUrl(f.urlImagen)}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }}
                        alt={`Foto evidencia ${i + 1}`}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            <a
              href={`https://www.google.com/maps?q=${modalEvento.latitud},${modalEvento.longitud}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <EnvironmentOutlined /> Ver ubicación exacta en Google Maps
            </a>

            <Select
              value={nuevoEstado}
              onChange={setNuevoEstado}
              style={{ width: '100%' }}
              size="large"
              options={[
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'en_proceso', label: 'En Proceso' },
                { value: 'resuelto', label: 'Resuelto' },
              ]}
            />
          </Space>
        )}
      </Modal>
    </div>
  );
}
