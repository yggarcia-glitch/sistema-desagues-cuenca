const { Router } = require('express');
const { registrar } = require('../controllers/auth.controller');
const { validarRegistro } = require('../middlewares/validate');

const router = Router();

// POST /auth/register — US-01: Registro de usuario ciudadano
router.post('/register', validarRegistro, registrar);

module.exports = router;
