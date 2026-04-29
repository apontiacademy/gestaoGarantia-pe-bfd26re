const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const controllerRegister = require('../controllers/RegisterUser');
const controllerLogin = require('../controllers/loginAuth');
const controllerProduto = require('../controllers/RegisterEquipments');
const controllerGarantia = require('../controllers/Garantia');        // ← Use o nome correto do seu arquivo

// Middleware de autenticação
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

router.post('/auth/register', controllerRegister.registerUser);
router.post('/auth/login', controllerLogin.Login);

router.get('/auth/profile', autenticarToken, async (req, res) => {
  try {
    const userId = req.user.idUsuario || req.user.id;
    const user = await Usuario.findByPk(userId);   // ← Você precisa importar Usuario

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get('/listar', autenticarToken, controllerRegister.listarUsuarios);

router.post('/produtos/:idUsuario', autenticarToken, controllerProduto.RegistrarProduto);
router.get('/produtos', autenticarToken, controllerProduto.listarProdutos);

router.post('/garantias', autenticarToken, controllerGarantia.RegistrarGarantia);
router.get('/garantias', autenticarToken, controllerGarantia.listarGarantias);
router.get('/garantias/:id', autenticarToken, controllerGarantia.listarGarantiaPorId);
router.put('/garantias/:id', autenticarToken, controllerGarantia.atualizarGarantia);
router.patch('/garantias/:id', autenticarToken, controllerGarantia.atualizarStatusGarantia);
router.delete('/garantias/:id', autenticarToken, controllerGarantia.excluirGarantia);

module.exports = router;