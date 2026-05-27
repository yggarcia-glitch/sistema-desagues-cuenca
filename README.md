# 🌊 Sistema de Gestión de Desagüesobstruidos
### Resiliencia Hídrica en Cuenca, Ecuador

![SCRUM](https://img.shields.io/badge/Metodología-SCRUM-0052CC?style=for-the-badge)
![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-green?style=for-the-badge)
![Instituto](https://img.shields.io/badge/Instituto-Tecnológico%20Sudamericano-00838F?style=for-the-badge)

---

## 📌 Descripción del Proyecto

Plataforma digital colaborativa que permite a los **596.101 habitantes de Cuenca** reportar desagüespluviales obstruidos mediante geolocalización y evidencia fotográfica, conectando a la ciudadanía con **ETAPA EP** para transformar el mantenimiento reactivo en **mantenimiento preventivo**.

> *"Empoderar al ciudadano como sensor activo de la infraestructura urbana"*

---

## 🎯 Objetivo

Reducir hasta un **50% los tiempos de movilización técnica** mediante la detección temprana de nodos críticos de saturación, utilizando una app móvil con integración GIS.

---

## 🏗️ Arquitectura del Sistema

```
├── App Móvil Ciudadana    → Reporte geolocalizado con fotos
├── Panel Técnico (Web)    → Dashboard para ETAPA EP
└── Base de Datos          → PostgreSQL + PostGIS (histórico preventivo)
```

---

## 📂 Estructura del Repositorio

```
📁 scrum-desagues/
├── 📄 README.md                    ← Este archivo
├── 📁 roles/
│   └── ROLES.md                   ← Definición de roles SCRUM
├── 📁 backlog/
│   └── PRODUCT_BACKLOG.md         ← 18 historias de usuario priorizadas
└── 📁 docs/
    └── SCRUM_CEREMONIES.md        ← Guía de ceremonias SCRUM
```

---

## 👥 Equipo SCRUM

| Rol              | Responsable                  |
|------------------|------------------------------|
| Product Owner    | Yosef García                 |
| Scrum Master     | Docente Tutor                |
| Dev Team         | Equipo de Desarrollo (3-5p)  |

---

## 📋 Estado del Backlog

| Prioridad | Historias | Puntos |
|-----------|-----------|--------|
| 🔴 Alta   | 7         | 28 pts |
| 🟡 Media  | 6         | 29 pts |
| 🟢 Baja   | 5         | 24 pts |
| **Total** | **18**    | **81** |

---

## 🚀 Sprints Planificados

| Sprint   | Objetivo principal                          |
|----------|---------------------------------------------|
| Sprint 1 | Registro, login y reporte básico con GPS    |
| Sprint 2 | Evidencia fotográfica y panel técnico base  |
| Sprint 3 | Seguimiento de reportes y cuadrillas        |
| Sprint 4 | Dashboard estadístico y notificaciones      |
| Sprint 5 | Mapa ciudadano, exportación y modo offline  |
| Sprint 6 | Administración y gamificación ciudadana     |

---

## 🌍 Contexto

- **Ciudad:** Cuenca, Ecuador
- **Población:** 596.101 hab. (INEC, 2022)
- **Entidad aliada:** ETAPA EP
- **Marco teórico:** SuDS · Resiliencia Hídrica · Gestión Colaborativa
- **Alineación:** ODS 11 — Ciudades sostenibles y resilientes

---

**Instituto Tecnológico Sudamericano** | Cuenca, Ecuador  
📧 yggarcia@sudamericano.edu.ec
