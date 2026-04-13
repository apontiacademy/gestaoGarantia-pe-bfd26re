const express = require('express');
const router = express.Router();

// Rota de Registro
router.post('/register', (req, res) => {
  res.status(201).json({ message: 'Página de registro' });
});

// Rota de Login
router.post('/login', (req, res) => {
  res.status(200).json({ message: 'Página de login' });
});

// Rota de Recuperação de Senha
router.post('/forgot-password', (req, res) => {
  res.status(200).json({ message: 'Página de recuperação de senha' });
});

module.exports = router;