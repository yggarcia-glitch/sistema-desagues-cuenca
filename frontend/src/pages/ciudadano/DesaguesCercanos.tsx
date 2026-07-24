import { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Segmented, Button, Space, Alert, List, Tag, Spin, App, Grid } from 'antd';
import { EnvironmentOutlined, AimOutlined, ReloadOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getDesaguesCercanos } from '../../api/eventos';
import type { DesagueCercano } from '../../types';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CUENCA_CENTER: [number, number] = [-2.9001, -79.0059];
const RADIOS = [50, 100, 200];

// Recentra el mapa cuando cambia la ubicación del usuario.
function RecentrarMapa({ centro }: { centro: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(centro);
  }, [centro, map]);
  return null;
}

export default function DesaguesCercanos() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const mapHeight = screens.md ? 460 : 320;

  const [ubicacion, setUbicacion] = useState<[number, number] | null>(null);
  const [radio, setRadio] = useState<number>(100);
  const [desagues, setDesagues] = useState<DesagueCercano[]>([]);
  const [loadingUbi, setLoadingUbi] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const buscar = useCallback(
    async (lat: number, lng: number, r: number) => {
      setLoadingData(true);
      try {
        const data = await getDesaguesCercanos(lat, lng, r);
        setDesagues(data);
      } catch {
        message.error('No se pudieron cargar los desagües cercanos.');
      } finally {
        setLoadingData(false);
      }
    },
    [message],
  );

  const ubicarme = useCallback(() => {
    if (!navigator.geolocation) {
      message.error('Tu navegador no soporta geolocalización.');
      return;
    }
    setLoadingUbi(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUbicacion(coords);
        setLoadingUbi(false);
        buscar(coords[0], coords[1], radio);
      },
      () => {
        setLoadingUbi(false);
        message.warning('No se pudo obtener tu ubicación. Usando el centro de Cuenca.');
        setUbicacion(CUENCA_CENTER);
        buscar(CUENCA_CENTER[0], CUENCA_CENTER[1], radio);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [buscar, radio, message]);

  // Ubicar al usuario al entrar.
  useEffect(() => {
    ubicarme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cambiarRadio(r: number) {
    setRadio(r);
    if (ubicacion) buscar(ubicacion[0], ubicacion[1], r);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={3} style={{ color: PRIMARY, marginBottom: 4 }}>
        <EnvironmentOutlined /> Desagües Cercanos
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Ubica los desagües registrados cerca de ti para reportar el correcto, aunque no conozcas la dirección exacta.
      </Text>

      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Text strong>Radio de búsqueda:</Text>
            <Segmented
              value={radio}
              onChange={(v) => cambiarRadio(v as number)}
              options={RADIOS.map((r) => ({ label: `${r} m`, value: r }))}
            />
          </Space>
          <Button icon={<AimOutlined />} onClick={ubicarme} loading={loadingUbi}>
            Usar mi ubicación
          </Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 8, marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <div style={{ height: mapHeight, borderRadius: 8, overflow: 'hidden' }}>
          <MapContainer center={ubicacion ?? CUENCA_CENTER} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {ubicacion && (
              <>
                <RecentrarMapa centro={ubicacion} />
                <Marker position={ubicacion}>
                  <Popup>Estás aquí</Popup>
                </Marker>
                <Circle
                  center={ubicacion}
                  radius={radio}
                  pathOptions={{ color: PRIMARY, fillColor: PRIMARY, fillOpacity: 0.08 }}
                />
                {desagues.map((d) => (
                  <CircleMarker
                    key={d.id}
                    center={[d.latitud, d.longitud]}
                    radius={8}
                    pathOptions={{
                      color: d.verificado ? '#1565c0' : '#f57c00',
                      fillColor: d.verificado ? '#1565c0' : '#f57c00',
                      fillOpacity: 0.85,
                    }}
                  >
                    <Popup>
                      <Space direction="vertical" size={2}>
                        <Text strong>{d.codigo}</Text>
                        {d.nombre && <Text>{d.nombre}</Text>}
                        <Text type="secondary" style={{ fontSize: 12 }}>{d.direccion}</Text>
                        <Text style={{ fontSize: 12 }}>A {d.distancia} m de ti</Text>
                        {!d.verificado && <Tag color="orange">No verificado</Tag>}
                      </Space>
                    </Popup>
                  </CircleMarker>
                ))}
              </>
            )}
          </MapContainer>
        </div>
      </Card>

      <Card
        style={{ borderRadius: 8 }}
        title={
          <Space>
            <span>Desagües en {radio} m</span>
            <Tag color={PRIMARY}>{desagues.length}</Tag>
            {loadingData && <Spin size="small" />}
          </Space>
        }
        extra={
          ubicacion && (
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => buscar(ubicacion[0], ubicacion[1], radio)}
            >
              Actualizar
            </Button>
          )
        }
      >
        {desagues.length === 0 && !loadingData ? (
          <Alert
            type="info"
            showIcon
            message={`No hay desagües registrados dentro de ${radio} m. Prueba a ampliar el radio.`}
          />
        ) : (
          <List
            dataSource={desagues}
            renderItem={(d) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <EnvironmentOutlined
                      style={{ fontSize: 20, color: d.verificado ? '#1565c0' : '#f57c00' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{d.codigo}</Text>
                      {d.nombre && <Text type="secondary">{d.nombre}</Text>}
                      {!d.verificado && <Tag color="orange">No verificado</Tag>}
                    </Space>
                  }
                  description={
                    <span>
                      {d.direccion}
                      {d.sector ? ` · ${d.sector.nombre}` : ''}
                    </span>
                  }
                />
                <Tag color={PRIMARY}>{d.distancia} m</Tag>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
