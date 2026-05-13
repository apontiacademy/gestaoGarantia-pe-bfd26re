const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Rotas relacionadas aos usuários
const controllerRegister = require('../controllers/RegisterUser');

// Middleware para validação do token JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;        // ou req.usuario, dependendo do que você usa
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}

router.get('/listar', autenticarToken, controllerRegister.listarUsuarios);

module.exports = router;