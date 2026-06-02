const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * POST /auth/register
 * US-01: Registro de usuario ciudadano
 */
const registrar = async (req, res) => {
  // Validar errores de express-validator
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { nombre, apellido, correo, telefono, contrasena } = req.body;

  try {
    // Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (usuarioExistente) {
      return res.status(409).json({ 
        mensaje: 'El correo ya esta registrado' 
      });
    }

    // Hash de la contrasena
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    // Crear usuario en la base de datos
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        correo,
        telefono: telefono || null,
        contrasenaHash,
        tipoUsuario: 'ciudadano'
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        tipoUsuario: true,
        fechaRegistro: true
      }
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, correo: nuevoUsuario.correo, tipo: nuevoUsuario.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { registrar };
