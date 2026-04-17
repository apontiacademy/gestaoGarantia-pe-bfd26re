const express = require('express');
const router = express.Router();

//MIDDLEWARE DE AUTENTICAÇÃO
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if(!authHeader) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(" ")[1]; // Espera o formato "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}

// Rota de Registro
router.post('/auth/register', (req, res) => {
  res.status(201).json({ message: 'Página de registro' });
});

// Rota de Login
router.post('/auth/login', (req, res) => {
  res.status(200).json({ message: 'Página de login' });
});

// Rota de Recuperação de Senha
/* router.post('/forgot-password', autenticarToken, (req, res) => {
  res.status(200).json({ message: 'Página de recuperação de senha',
    user: req.user
   })
}); */

module.exports = router;