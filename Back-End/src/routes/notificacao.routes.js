const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const controller = require('../controllers/Notificacao');

function autenticarToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token não fornecido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch {

    return res.status(403).json({
      message: 'Token inválido'
    });

  }
}

router.get('/notificacoes',autenticarToken,controller.listar);
router.patch('/notificacoes/:id/read',autenticarToken,controller.marcarComoLida);
router.patch('/notificacoes/read-all',autenticarToken,controller.marcarTodasComoLidas);
router.delete('/notificacoes/all',autenticarToken,controller.limparTodas);

module.exports = router;