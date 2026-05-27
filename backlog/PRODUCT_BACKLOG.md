# 📋 Product Backlog — Sistema de Gestión de Desagüesobstruidos

> **Proyecto:** Resiliencia Hídrica en Cuenca — Plataforma de Reporte Ciudadano  
> **Product Owner:** Yosef García  
> **Formato:** Como [rol], quiero [funcionalidad], para [beneficio]

---

## 🔴 PRIORIDAD ALTA — Sprint 1 y 2

| ID   | Historia de Usuario | Criterios de Aceptación | Puntos |
|------|---------------------|-------------------------|--------|
| US-01 | **Como ciudadano**, quiero registrarme en la app con mi correo y contraseña, para poder enviar reportes identificados. | - Formulario con nombre, correo, teléfono y contraseña. - Validación de correo único. - Confirmación por email. | 3 |
| US-02 | **Como ciudadano**, quiero iniciar sesión en la app, para acceder a mis reportes anteriores. | - Login con correo y contraseña. - Manejo de error por credenciales incorrectas. - Opción "olvidé mi contraseña". | 2 |
| US-03 | **Como ciudadano**, quiero reportar un desagüeobstruido con mi ubicación actual, para que ETAPA EP sepa exactamente dónde está el problema. | - Botón de geolocalización automática. - Mapa interactivo para confirmar ubicación. - Coordenadas almacenadas con precisión DECIMAL(10,7). | 5 |
| US-04 | **Como ciudadano**, quiero adjuntar una foto como evidencia al reporte, para que el técnico pueda evaluar la gravedad antes de ir. | - Selección de foto desde galería o cámara. - Máximo 3 fotos por reporte. - Vista previa antes de enviar. | 3 |
| US-05 | **Como ciudadano**, quiero añadir una descripción al reporte, para detallar el tipo de obstrucción que veo. | - Campo de texto con mínimo 20 y máximo 500 caracteres. - Campo obligatorio. | 2 |
| US-06 | **Como técnico de ETAPA EP**, quiero ver todos los reportes en un mapa, para identificar rápidamente las zonas con más incidencias. | - Mapa con marcadores por reporte. - Colores según prioridad (rojo=alta, amarillo=media, verde=baja). - Filtro por estado y sector. | 8 |
| US-07 | **Como técnico de ETAPA EP**, quiero cambiar el estado de un reporte (pendiente → en proceso → resuelto), para que el ciudadano sepa que su reporte fue atendido. | - Botones de cambio de estado en el panel. - Notificación automática al ciudadano. - Registro en historial con fecha y usuario. | 5 |

---

## 🟡 PRIORIDAD MEDIA — Sprint 3 y 4

| ID   | Historia de Usuario | Criterios de Aceptación | Puntos |
|------|---------------------|-------------------------|--------|
| US-08 | **Como ciudadano**, quiero ver el estado actual de mi reporte, para saber si ya fue atendido. | - Pantalla "Mis reportes" con estado actualizado. - Indicador visual de progreso (pendiente/en proceso/resuelto). | 3 |
| US-09 | **Como técnico**, quiero asignar una cuadrilla a un reporte, para organizar el despacho del equipo técnico. | - Lista desplegable de cuadrillas disponibles. - Registro de fecha y hora de asignación. - El líder de la cuadrilla recibe notificación. | 5 |
| US-10 | **Como técnico**, quiero registrar el resultado de la intervención, para documentar si el problema fue resuelto. | - Campo de observaciones post-intervención. - Selector de resultado: resuelto / parcial / sin solución. - Fecha de intervención registrada automáticamente. | 3 |
| US-11 | **Como administrador**, quiero ver un dashboard con estadísticas de reportes por sector, para identificar las zonas más críticas de Cuenca. | - Gráfico de barras de reportes por sector. - Indicador de tiempo promedio de resolución. - Filtro por rango de fechas. | 8 |
| US-12 | **Como ciudadano**, quiero recibir una notificación push cuando mi reporte cambie de estado, para estar informado sin revisar la app constantemente. | - Notificación en tiempo real al cambiar el estado. - Mensaje descriptivo del nuevo estado. - Funciona en iOS y Android. | 5 |
| US-13 | **Como técnico**, quiero ver el historial de reportes de un desagüeespecífico, para saber si es un punto recurrente de obstrucción. | - Vista de historial por ID de desagüe. - Lista cronológica de todos los reportes anteriores. - Indicador de frecuencia de obstrucción. | 5 |

---

## 🟢 PRIORIDAD BAJA — Sprint 5 y 6

| ID   | Historia de Usuario | Criterios de Aceptación | Puntos |
|------|---------------------|-------------------------|--------|
| US-14 | **Como ciudadano**, quiero ver en el mapa los desagüescercanos a mi ubicación, para reportar el correcto aunque no conozca la dirección exacta. | - Mapa con marcadores de desagüesregistrados. - Radio de búsqueda configurable (50m, 100m, 200m). | 5 |
| US-15 | **Como administrador**, quiero exportar el reporte histórico de incidencias en formato CSV, para integrarlo con modelos hidrológicos de planificación. | - Botón de exportación en el dashboard. - Archivo CSV con: ID, coordenadas, fecha, sector, estado, cuadrilla. - Filtro por rango de fechas antes de exportar. | 5 |
| US-16 | **Como ciudadano**, quiero poder reportar un desagüeobstruido sin conexión a internet, para no depender de la señal en zonas con baja cobertura. | - Almacenamiento local del reporte offline. - Sincronización automática al recuperar conexión. - Indicador de reportes pendientes de sincronizar. | 8 |
| US-17 | **Como administrador**, quiero gestionar los usuarios técnicos (crear, editar, desactivar), para controlar quién tiene acceso al panel de ETAPA EP. | - CRUD completo de usuarios técnicos. - Asignación de roles: técnico o administrador. - Desactivación sin eliminar historial. | 3 |
| US-18 | **Como ciudadano**, quiero ver un ranking de sectores con más reportes resueltos, para reconocer la gestión efectiva de ETAPA EP en mi zona. | - Listado de sectores ordenado por reportes resueltos. - Porcentaje de efectividad por sector. - Actualización semanal. | 3 |

---

## 📊 Resumen del Backlog

| Prioridad | Historias | Puntos totales |
|-----------|-----------|----------------|
| 🔴 Alta   | 7 (US-01 a US-07) | 28 pts |
| 🟡 Media  | 6 (US-08 a US-13) | 29 pts |
| 🟢 Baja   | 5 (US-14 a US-18) | 24 pts |
| **Total** | **18 historias** | **81 pts** |

---

## 🏃 Sprints Sugeridos

| Sprint | Duración | Historias | Objetivo                                      |
|--------|----------|-----------|-----------------------------------------------|
| Sprint 1 | 2 semanas | US-01, US-02, US-03 | Registro, login y reporte básico con GPS       |
| Sprint 2 | 2 semanas | US-04, US-05, US-06, US-07 | Evidencia fotográfica y panel técnico base     |
| Sprint 3 | 2 semanas | US-08, US-09, US-10 | Seguimiento de reportes y gestión de cuadrillas|
| Sprint 4 | 2 semanas | US-11, US-12, US-13 | Dashboard estadístico y notificaciones         |
| Sprint 5 | 2 semanas | US-14, US-15, US-16 | Mapa ciudadano, exportación y modo offline     |
| Sprint 6 | 2 semanas | US-17, US-18 | Administración y gamificación ciudadana        |
