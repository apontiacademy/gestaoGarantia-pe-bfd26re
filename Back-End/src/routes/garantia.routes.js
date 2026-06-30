const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Rotas de gerenciamento de garantias
const controllerGarantia = require('../controllers/Garantia');
const controllerGarantiaEstendida = require('../controllers/GarantiaEstendida');

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

// Rotas de garantias (protegidas por autenticação)
router.get('/garantias', autenticarToken, controllerGarantia.listarGarantias);
router.get('/garantias/lixeira', autenticarToken, controllerGarantia.listarLixeira);
router.get('/garantias/:id', autenticarToken, controllerGarantia.listarGarantiaPorId);
router.post('/garantias', autenticarToken, controllerGarantia.RegistrarGarantia);
router.put('/garantias/:id', autenticarToken, controllerGarantia.atualizarGarantia);
router.patch('/garantias/:id/restaurar', autenticarToken, controllerGarantia.restaurarGarantia);
router.patch('/garantias/:id', autenticarToken, controllerGarantia.atualizarStatusGarantia);
router.delete('/garantias/:id/permanente', autenticarToken, controllerGarantia.excluirPermanentemente);
router.delete('/garantias/:id', autenticarToken, controllerGarantia.excluirGarantia);

// Rotas de garantias estendidas (protegidas por autenticação)
router.get('/garantias-estendidas', autenticarToken, controllerGarantiaEstendida.listarGarantiasEstendidas);
router.get('/garantias-estendidas/:id', autenticarToken, controllerGarantiaEstendida.listarGarantiaEstendidaPorId);
router.post('/garantias-estendidas', autenticarToken, controllerGarantiaEstendida.registrarGarantiaEstendida);
router.put('/garantias-estendidas/:id', autenticarToken, controllerGarantiaEstendida.atualizarGarantiaEstendida);
router.patch('/garantias-estendidas/:id', autenticarToken, controllerGarantiaEstendida.atualizarStatusGarantiaEstendida);
router.delete('/garantias-estendidas/:id', autenticarToken, controllerGarantiaEstendida.excluirGarantiaEstendida);

module.exports = router;