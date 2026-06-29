import { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, Button, Typography, App,
  Upload, Space, Tag, Alert,
} from 'antd';
import { UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { UploadFile } from 'antd';
import { crearEvento, subirFoto, getDesagues } from '../../api/eventos';
import type { Desague } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const PRIMARY = '#1B5E20';

// Fix default marker icons for Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CUENCA_CENTER: [number, number] = [-2.9001, -79.0059];

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onSelect(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function CrearEvento() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [desagues, setDesagues] = useState<Desague[]>([]);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    getDesagues()
      .then(setDesagues)
      .catch(() => message.warning('No se pudieron cargar los desagüe. Contacta al administrador.'));
  }, []);

  function handleMapClick(lat: number, lng: number) {
    setUbicacion({ lat, lng });
    form.setFieldsValue({ latitud: lat.toFixed(7), longitud: lng.toFixed(7) });
  }

  async function onFinish(values: {
    desagueId: number;
    descripcion: string;
    prioridad: 'alta' | 'media' | 'baja';
  }) {
    if (!ubicacion) {
      message.error('Selecciona la ubicación en el mapa haciendo clic sobre él.');
      return;
    }
    setLoading(true);
    try {
      const evento = await crearEvento({
        desagueId: Number(values.desagueId),
        descripcion: values.descripcion,
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
        prioridad: values.prioridad,
      });

      // Save to localStorage for "Mis Reportes"
      const stored = JSON.parse(localStorage.getItem('mis_reportes') ?? '[]');
      stored.unshift({
        id: evento.id,
        descripcion: evento.descripcion,
        prioridad: values.prioridad,
        estado: 'pendiente',
        fechaEvento: new Date().toISOString(),
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
      });
      localStorage.setItem('mis_reportes', JSON.stringify(stored));

      // Upload photo if provided
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          await subirFoto(evento.id, fileList[0].originFileObj as File);
        } catch {
          message.warning('Reporte creado pero no se pudo subir la foto.');
        }
      }

      message.success(`Reporte #${evento.id} enviado exitosamente.`);
      setSubmitted(true);
      form.resetFields();
      setUbicacion(null);
      setFileList([]);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (e: any) {
      message.error(e.response?.data?.message ?? 'Error al enviar el reporte. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 4 }}>
        <EnvironmentOutlined /> Crear Reporte de Desagüe
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Reporta un desagüeobstruido en tu sector. Nuestro equipo técnico atenderá tu solicitud.
      </Text>

      {submitted && (
        <Alert
          message="¡Reporte enviado exitosamente!"
          description="Tu reporte fue registrado. Puedes ver el estado en 'Mis Reportes'."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        <Card style={{ marginBottom: 16, borderRadius: 8 }}>
          <Form.Item
            name="desagueId"
            label="Desagüe afectado"
            rules={[{ required: true, message: 'Selecciona un desagüe' }]}
          >
            <Select
              placeholder="Selecciona el desagüepor su código o dirección"
              showSearch
              optionFilterProp="label"
              options={desagues.map((d) => ({
                value: d.id,
                label: `${d.codigo} — ${d.direccion}${d.sector ? ' (' + d.sector.nombre + ')' : ''}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción del problema"
            rules={[
              { required: true, message: 'Describe el problema' },
              { min: 20, message: 'Mínimo 20 caracteres' },
              { max: 500, message: 'Máximo 500 caracteres' },
            ]}
          >
            <TextArea
              rows={4}
              showCount
              maxLength={500}
              placeholder="Describe el problema con detalle. Ej: El desagüeestá completamente bloqueado con basura, se acumula agua en la calle..."
            />
          </Form.Item>

          <Form.Item
            name="prioridad"
            label="Prioridad"
            rules={[{ required: true, message: 'Selecciona la prioridad' }]}
          >
            <Select placeholder="¿Qué tan urgente es?">
              <Select.Option value="alta">
                <Tag color="red">ALTA</Tag> — Riesgo inmediato, agua acumulada
              </Select.Option>
              <Select.Option value="media">
                <Tag color="orange">MEDIA</Tag> — Bloqueo parcial
              </Select.Option>
              <Select.Option value="baja">
                <Tag color="green">BAJA</Tag> — Mantenimiento preventivo
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Foto de evidencia (opcional)">
            <Upload
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Seleccionar foto</Button>
            </Upload>
          </Form.Item>
        </Card>

        <Card
          title={
            <Space>
              <EnvironmentOutlined style={{ color: PRIMARY }} />
              <span>Ubicación en el mapa</span>
              {ubicacion && (
                <Tag color="green">
                  {ubicacion.lat.toFixed(5)}, {ubicacion.lng.toFixed(5)}
                </Tag>
              )}
            </Space>
          }
          style={{ marginBottom: 16, borderRadius: 8 }}
        >
          {!ubicacion && (
            <Alert
              message="Haz clic en el mapa para marcar la ubicación exacta del desagüe"
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}
          <div style={{ height: 380, borderRadius: 8, overflow: 'hidden' }}>
            <MapContainer
              center={CUENCA_CENTER}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onSelect={handleMapClick} />
              {ubicacion && <Marker position={[ubicacion.lat, ubicacion.lng]} />}
            </MapContainer>
          </div>
        </Card>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
            style={{ background: PRIMARY, borderColor: PRIMARY, height: 48, fontSize: 16 }}
          >
            Enviar Reporte
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
