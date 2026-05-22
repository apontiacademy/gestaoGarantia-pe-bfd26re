const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Rotas de autenticação e gerenciamento de conta
const controllerRegister = require('../controllers/RegisterUser');
const controllerLogin = require('../controllers/loginAuth');

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

// Perfil do usuário autenticado
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

// Cadastro de usuário
router.post('/auth/register', controllerRegister.registerUser);

// Login de usuário
router.post('/auth/login', controllerLogin.Login);

// Alteração de senha (usuário autenticado)
router.post('/auth/change-password', autenticarToken, controllerLogin.AlterarSenha);

// Solicitação de redefinição de senha (usuário não autenticado)
router.post('/auth/forgot-password', controllerLogin.EsqueciSenha);

router.post('/auth/verify-reset-code', controllerLogin.VerificarCodigoReset);

// Redefinição de senha via token enviado por e-mail (usuário não autenticado)
router.post('/auth/reset-password', controllerLogin.ResetarSenha);

module.exports = router;