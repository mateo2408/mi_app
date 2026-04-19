// Middleware de autorización JWT para rutas privadas.
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  // Espera formato: Authorization: Bearer <token>
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token faltante' });
  }

  const token = header.slice(7);

  try {
    // Token decodificado queda disponible en req.auth.
    req.auth = jwt.verify(token, process.env.JWT_SECRET || 'mi-veterinaria-secret');
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = { requireAuth };
