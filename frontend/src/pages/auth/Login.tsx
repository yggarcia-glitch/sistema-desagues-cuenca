import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { MailOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { doLogin } = useAuth();

  async function onFinish(values: { correo: string; contrasena: string }) {
    setLoading(true);
    setError('');
    try {
      const data = await login(values);
      doLogin(data.usuario, data.token);
      const rol = data.usuario.tipoUsuario;
      if (rol === 'ciudadano') navigate('/ciudadano/mis-reportes');
      else if (rol === 'tecnico') navigate('/tecnico/dashboard');
      else navigate('/admin/estadisticas');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${PRIMARY} 0%, #2e7d32 50%, #1a237e 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <Card style={{ width: '100%', maxWidth: 420, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center', marginBottom: 28 }}>
          <EnvironmentOutlined style={{ fontSize: 40, color: PRIMARY }} />
          <Title level={3} style={{ margin: 0, color: PRIMARY }}>Sistema Desagüe</Title>
          <Text type="secondary">Cuenca · ETAPA EP</Text>
        </Space>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="correo"
            rules={[{ required: true, message: 'Ingresa tu correo' }, { type: 'email', message: 'Correo inválido' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Correo electrónico" />
          </Form.Item>

          <Form.Item
            name="contrasena"
            rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ background: PRIMARY, borderColor: PRIMARY, height: 44 }}
            >
              Ingresar
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">¿No tienes cuenta? </Text>
          <Link to="/registro">Regístrate aquí</Link>
        </div>
      </Card>
    </div>
  );
}
