import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Typography, Spin, Space, Grid } from 'antd';

const { useBreakpoint } = Grid;
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getEventosMapa } from '../../api/panel';
import type { EventoMapa } from '../../types';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';
const CUENCA_CENTER: [number, number] = [-2.9001, -79.0059];

const PRIORIDAD_COLOR: Record<string, string> = {
  alta: '#c62828',
  media: '#f57c00',
  baja: '#2e7d32',
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
};

// Pin tipo gota bien contrastado para que resalte sobre los iconos del mapa base.
const pinCache: Record<string, L.DivIcon> = {};
function pinDesague(color: string): L.DivIcon {
  if (pinCache[color]) return pinCache[color];
  const icon = L.divIcon({
    className: 'pin-desague',
    html: `<div style="position:relative;width:30px;height:42px;">
      <div style="position:absolute;top:0;left:2px;width:26px;height:26px;background:${color};border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 6px rgba(0,0,0,.45);"></div>
      <div style="position:absolute;top:8px;left:11px;width:8px;height:8px;background:#fff;border-radius:50%;"></div>
    </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
  pinCache[color] = icon;
  return icon;
}

export default function Dashboard() {
  const [eventos, setEventos] = useState<EventoMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();
  const mapHeight = screens.md ? 520 : 320;

  useEffect(() => {
    getEventosMapa()
      .then(setEventos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const conteo = eventos.reduce(
    (acc, e) => {
      const estado = e.estado?.nombre ?? 'pendiente';
      acc[estado] = (acc[estado] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 20 }}>
        Mapa en Vivo — Eventos de Desagüe
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: `4px solid ${PRIMARY}` }}>
            <Statistic title="Total eventos" value={eventos.length} valueStyle={{ color: PRIMARY }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #f57c00' }}>
            <Statistic title="Pendientes" value={conteo['pendiente'] ?? 0} valueStyle={{ color: '#f57c00' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 8, borderLeft: '4px solid #1565c0' }}>
            <Statistic title="En proceso" value={conteo['en_proceso'] ?? 0} valueStyle={{ color: '#1565c0' }} />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 8 }}
        title={
          <Space>
            <span>Mapa interactivo de Cuenca</span>
            <Space size={4}>
              {(['alta', 'media', 'baja'] as const).map((p) => (
                <Tag key={p} color={p === 'alta' ? 'red' : p === 'media' ? 'orange' : 'green'}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Tag>
              ))}
            </Space>
          </Space>
        }
      >
        {loading ? (
          <div style={{ height: mapHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ height: mapHeight, borderRadius: 6, overflow: 'hidden' }}>
            <MapContainer center={CUENCA_CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {eventos
                .filter((e) => e.latitud && e.longitud)
                .map((e) => (
                  <Marker
                    key={e.id}
                    position={[e.latitud, e.longitud]}
                    icon={pinDesague(PRIORIDAD_COLOR[e.prioridad?.nombre] ?? '#666')}
                  >
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <Text strong>Evento #{e.id}</Text>
                        <br />
                        <Tag
                          color={
                            e.prioridad?.nombre === 'alta'
                              ? 'red'
                              : e.prioridad?.nombre === 'media'
                                ? 'orange'
                                : 'green'
                          }
                          style={{ marginTop: 4 }}
                        >
                          {e.prioridad?.nombre?.toUpperCase()}
                        </Tag>
                        <Tag style={{ marginTop: 4 }}>
                          {ESTADO_LABEL[e.estado?.nombre] ?? e.estado?.nombre}
                        </Tag>
                        <br />
                        {e.desague?.sector && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Sector: {e.desague.sector.nombre}
                          </Text>
                        )}
                        <br />
                        <Text style={{ fontSize: 12 }}>{e.descripcion}</Text>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
