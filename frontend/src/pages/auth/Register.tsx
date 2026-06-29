import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { register } from '../../api/auth';

const { Title, Text } = Typography;
const PRIMARY = '#1B5E20';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { message } = App.useApp();

  async function onFinish(values: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    contrasena: string;
  }) {
    setLoading(true);
    setError('');
    try {
      await register(values);
      message.success('Cuenta creada exitosamente. Por favor inicia sesión.');
      navigate('/login');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Error al registrar. Intenta de nuevo.');
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
      <Card style={{ width: '100%', maxWidth: 460, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}>
          <EnvironmentOutlined style={{ fontSize: 36, color: PRIMARY }} />
          <Title level={3} style={{ margin: 0, color: PRIMARY }}>Crear Cuenta</Title>
          <Text type="secondary">Sistema de Gestión de Desagüesobstruidos</Text>
        </Space>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={onFinish} size="large">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Juan" />
            </Form.Item>

            <Form.Item
              name="apellido"
              label="Apellido"
              rules={[{ required: true, message: 'Requerido' }]}
            >
              <Input placeholder="García" />
            </Form.Item>
          </div>

          <Form.Item
            name="correo"
            label="Correo electrónico"
            rules={[
              { required: true, message: 'Requerido' },
              { type: 'email', message: 'Correo inválido' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="juan@ejemplo.com" />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono (opcional)">
            <Input prefix={<PhoneOutlined />} placeholder="0991234567" />
          </Form.Item>

          <Form.Item
            name="contrasena"
            label="Contraseña"
            rules={[{ required: true, message: 'Requerido' }, { min: 6, message: 'Mínimo 6 caracteres' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 6 caracteres" />
          </Form.Item>

          <Form.Item
            name="confirmar"
            label="Confirmar contraseña"
            dependencies={['contrasena']}
            rules={[
              { required: true, message: 'Requerido' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('contrasena') === value) return Promise.resolve();
                  return Promise.reject('Las contraseñas no coinciden');
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Repite la contraseña" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ background: PRIMARY, borderColor: PRIMARY, height: 44 }}
            >
              Crear cuenta
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">¿Ya tienes cuenta? </Text>
          <Link to="/login">Inicia sesión</Link>
        </div>
      </Card>
    </div>
  );
}
