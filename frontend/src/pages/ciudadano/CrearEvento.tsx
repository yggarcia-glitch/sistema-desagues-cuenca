import { useState } from 'react';
import {
  Card, Form, Input, Button, Typography, App,
  Upload, Space, Alert, Grid, Row, Col,
} from 'antd';
import { UploadOutlined, EnvironmentOutlined, CheckCircleOutlined, ThunderboltOutlined, WarningOutlined, CheckOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { UploadFile } from 'antd';
import { crearEvento, subirFoto } from '../../api/eventos';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { TextArea } = Input;
const PRIMARY = '#1B5E20';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CUENCA_CENTER: [number, number] = [-2.9001, -79.0059];

const PRIORIDADES = [
  {
    value: 'alta' as const,
    label: 'URGENTE',
    descripcion: 'Agua acumulada, riesgo de inundación',
    color: '#ff4d4f',
    bg: '#fff1f0',
    border: '#ff4d4f',
    icon: <ThunderboltOutlined />,
  },
  {
    value: 'media' as const,
    label: 'MODERADO',
    descripcion: 'Bloqueo parcial, fluye con dificultad',
    color: '#fa8c16',
    bg: '#fff7e6',
    border: '#fa8c16',
    icon: <WarningOutlined />,
  },
  {
    value: 'baja' as const,
    label: 'LEVE',
    descripcion: 'Sin urgencia, mantenimiento preventivo',
    color: '#52c41a',
    bg: '#f6ffed',
    border: '#52c41a',
    icon: <CheckOutlined />,
  },
];

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onSelect(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function CrearEvento() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [prioridad, setPrioridad] = useState<'alta' | 'media' | 'baja' | null>(null);
  const [prioridadError, setPrioridadError] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const mapHeight = screens.md ? 420 : 280;

  async function onFinish(values: { descripcion?: string }) {
    if (!ubicacion) {
      message.error('Marca la ubicación en el mapa antes de enviar.');
      return;
    }
    if (!prioridad) {
      setPrioridadError(true);
      message.error('Selecciona el nivel de urgencia.');
      return;
    }
    setPrioridadError(false);
    setLoading(true);
    try {
      const evento = await crearEvento({
        descripcion: values.descripcion ?? '',
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
        prioridad,
      });

      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          await subirFoto(evento.id, fileList[0].originFileObj as File);
        } catch (fotoErr: any) {
          const detalle = fotoErr?.response?.data?.message ?? fotoErr?.message ?? 'error desconocido';
          message.warning(`Reporte enviado pero no se pudo subir la foto: ${detalle}`);
        }
      }

      message.success(`¡Reporte #${evento.id} enviado! El equipo técnico lo atenderá pronto.`);
      setSubmitted(true);
      form.resetFields();
      setUbicacion(null);
      setPrioridad(null);
      setFileList([]);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (e: any) {
      message.error(e.response?.data?.message ?? 'Error al enviar el reporte. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 4 }}>
        <EnvironmentOutlined /> Reportar Desagüe Obstruido
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Marca en el mapa dónde está el problema y describe lo que ves. El equipo técnico lo atenderá.
      </Text>

      {submitted && (
        <Alert
          message="¡Reporte enviado exitosamente!"
          description="Tu reporte fue registrado. Puedes ver su estado en 'Mis Reportes'."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">

        <Card
          style={{ marginBottom: 16, borderRadius: 8 }}
          title={
            <Space>
              <EnvironmentOutlined style={{ color: PRIMARY }} />
              <span>1. Marca la ubicación en el mapa</span>
            </Space>
          }
        >
          {!ubicacion ? (
            <Alert
              message="Toca o haz clic en el mapa para indicar dónde está el desagüe obstruido"
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
            />
          ) : (
            <Alert
              icon={<CheckCircleOutlined />}
              message={
                <Space>
                  <Text>Ubicación marcada correctamente.</Text>
                  <a onClick={() => setUbicacion(null)} style={{ cursor: 'pointer', fontSize: 12 }}>
                    Cambiar
                  </a>
                </Space>
              }
              type="success"
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}

          <div style={{ height: mapHeight, borderRadius: 8, overflow: 'hidden' }}>
            <MapContainer center={CUENCA_CENTER} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onSelect={(lat, lng) => setUbicacion({ lat, lng })} />
              {ubicacion && <Marker position={[ubicacion.lat, ubicacion.lng]} />}
            </MapContainer>
          </div>

          {ubicacion && (
            <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
              Coordenadas: {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}
            </Text>
          )}
        </Card>

        {/* Urgencia justo debajo del mapa */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 15 }}>
            2. ¿Qué tan urgente es?
          </Text>
          {prioridadError && (
            <Text type="danger" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
              Selecciona el nivel de urgencia
            </Text>
          )}
          <Row gutter={12}>
            {PRIORIDADES.map((p) => {
              const seleccionada = prioridad === p.value;
              return (
                <Col xs={8} key={p.value}>
                  <Card
                    hoverable
                    onClick={() => { setPrioridad(p.value); setPrioridadError(false); }}
                    style={{
                      borderRadius: 8,
                      borderColor: seleccionada ? p.border : '#d9d9d9',
                      borderWidth: seleccionada ? 2 : 1,
                      background: seleccionada ? p.bg : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    styles={{ body: { padding: '12px 8px' } }}
                  >
                    <div style={{ fontSize: 22, color: p.color, marginBottom: 4 }}>{p.icon}</div>
                    <Text strong style={{ color: p.color, fontSize: 13, display: 'block' }}>
                      {p.label}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {p.descripcion}
                    </Text>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        <Card style={{ marginBottom: 16, borderRadius: 8 }} title="3. Describe el problema (opcional)">
          <Form.Item
            name="descripcion"
            label="¿Qué está pasando?"
            rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
          >
            <TextArea
              rows={4}
              showCount
              maxLength={500}
              placeholder="Ej: El desagüe está completamente bloqueado con basura, se acumula agua en la calle..."
            />
          </Form.Item>

          <Form.Item label="Foto de evidencia (opcional)">
            <Upload
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Adjuntar foto</Button>
            </Upload>
          </Form.Item>
        </Card>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={!ubicacion}
            size="large"
            style={{ background: PRIMARY, borderColor: PRIMARY, height: 50, fontSize: 16 }}
          >
            {ubicacion ? 'Enviar Reporte' : 'Primero marca la ubicación en el mapa'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
