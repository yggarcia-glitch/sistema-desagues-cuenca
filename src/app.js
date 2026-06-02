const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');

dotenv.config();

const app = express();
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Sistema de Gestion de Desagues Obstruidos - API',
    version: '1.0.0',
    estado: 'activo'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
