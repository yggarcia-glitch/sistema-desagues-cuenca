# API Endpoints — Sistema de Desagues Obstruidos

## Autenticacion

### POST /auth/register
Registro de nuevo usuario ciudadano.

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "correo": "juan@ejemplo.com",
  "telefono": "0991234567",
  "contrasena": "Segura123"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Perez",
    "correo": "juan@ejemplo.com",
    "tipoUsuario": "ciudadano",
    "fechaRegistro": "2026-06-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores posibles:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | Campos invalidos o faltantes |
| 409 | El correo ya esta registrado |
| 500 | Error interno del servidor |

---
*US-01 - Sprint 1 - Sistema de Gestion de Desagues Obstruidos*
