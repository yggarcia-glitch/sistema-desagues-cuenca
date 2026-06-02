const { body } = require('express-validator');

/**
 * Validaciones para POST /auth/register
 * US-01: Registro de usuario ciudadano
 */
const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 80 }).withMessage('El nombre no puede superar 80 caracteres'),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ max: 80 }).withMessage('El apellido no puede superar 80 caracteres'),

  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Debe ingresar un correo valido')
    .normalizeEmail(),

  body('telefono')
    .optional()
    .isMobilePhone().withMessage('Numero de telefono invalido'),

  body('contrasena')
    .notEmpty().withMessage('La contrasena es obligatoria')
    .isLength({ min: 8 }).withMessage('La contrasena debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayuscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un numero'),
];

module.exports = { validarRegistro };
