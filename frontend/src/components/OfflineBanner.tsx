import { useEffect, useState, useCallback } from 'react';
import { Alert, Button, Space, App } from 'antd';
import { CloudSyncOutlined, WifiOutlined } from '@ant-design/icons';
import {
  getPendientes,
  suscribir,
  sincronizar,
  type ReporteOffline,
} from '../offline/offlineReports';

// US-16: barra que muestra el estado de conexión y los reportes pendientes
// de sincronizar. Sincroniza automáticamente al recuperar la conexión.
export default function OfflineBanner() {
  const { message } = App.useApp();
  const [online, setOnline] = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState<ReporteOffline[]>(getPendientes());
  const [sincronizando, setSincronizando] = useState(false);

  const hacerSync = useCallback(
    async (silencioso = false) => {
      if (getPendientes().length === 0) return;
      setSincronizando(true);
      try {
        const { enviados } = await sincronizar();
        if (enviados > 0) {
          message.success(`${enviados} reporte${enviados > 1 ? 's' : ''} sincronizado${enviados > 1 ? 's' : ''}.`);
        } else if (!silencioso) {
          message.info('No se pudo sincronizar todavía. Se reintentará automáticamente.');
        }
      } finally {
        setSincronizando(false);
      }
    },
    [message],
  );

  useEffect(() => {
    const unsub = suscribir(setPendientes);

    const onOnline = () => {
      setOnline(true);
      hacerSync(true);
    };
    const onOffline = () => setOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Intento inicial por si quedaron pendientes de una sesión anterior.
    if (navigator.onLine) hacerSync(true);

    return () => {
      unsub();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [hacerSync]);

  if (online && pendientes.length === 0) return null;

  if (!online) {
    return (
      <Alert
        style={{ marginBottom: 16, borderRadius: 8 }}
        type="warning"
        showIcon
        icon={<WifiOutlined />}
        message="Sin conexión a internet"
        description={
          pendientes.length > 0
            ? `Tienes ${pendientes.length} reporte(s) guardado(s) que se enviarán automáticamente al recuperar la señal.`
            : 'Tus reportes se guardarán en el dispositivo y se enviarán cuando vuelva la conexión.'
        }
      />
    );
  }

  return (
    <Alert
      style={{ marginBottom: 16, borderRadius: 8 }}
      type="info"
      showIcon
      icon={<CloudSyncOutlined spin={sincronizando} />}
      message={`${pendientes.length} reporte(s) pendiente(s) de sincronizar`}
      action={
        <Space>
          <Button size="small" type="primary" loading={sincronizando} onClick={() => hacerSync(false)}>
            Sincronizar ahora
          </Button>
        </Space>
      }
    />
  );
}
