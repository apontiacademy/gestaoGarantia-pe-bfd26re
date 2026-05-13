const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Rotas de gerenciamento de produtos
const controllerProduto = require('../controllers/RegisterEquipments');

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

// Rotas de produtos (protegidas por autenticação)
router.get('/produtos', autenticarToken, controllerProduto.listarProdutos);
router.post('/produtos/:idUsuario', autenticarToken, controllerProduto.RegistrarProduto);
router.put('/produtos/:id', autenticarToken, controllerProduto.atualizarProduto);
router.patch('/produtos/:id/status', autenticarToken, controllerProduto.atualizarStatusProduto);
router.delete('/produtos/:id', autenticarToken, controllerProduto.excluirProduto);

module.exports = router;