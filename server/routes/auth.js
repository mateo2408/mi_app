// Rutas de autenticación y perfil de sesión activa.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  // Normaliza correo para comparación consistente.
  const user = await User.findOne({ email: email.toLowerCase().trim(), active: true });

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Compara hash almacenado vs contraseña ingresada.
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // JWT con claims básicos de identidad/rol.
  const token = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      email: user.email
    },
    process.env.JWT_SECRET || 'mi-veterinaria-secret',
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

router.get('/me', requireAuth, async (req, res) => {
  // req.auth.sub viene del middleware JWT.
  const user = await User.findById(req.auth.sub).select('fullName email role');

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  return res.json(user);
});

module.exports = router;
