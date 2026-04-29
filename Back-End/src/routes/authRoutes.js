const express = require('express');
const router = express.Router();
const controllerRegister = require('../controllers/RegisterUser');
const controllerLogin = require('../controllers/loginAuth');
const listarUsuarios = require('../controllers/RegisterUser');
const controllerProduto = require('../controllers/RegisterEquipments');
const controllerGarantia = require('../controllers/GarantiaController');
const autenticarToken = require("../Middlwares/authToken");
const db = require('../models');
const Usuario  = db.Usuario;


// Rota de Registro
router.post('/auth/register', controllerRegister.registerUser);

// Rota de Login
router.post('/auth/login', controllerLogin.Login);

//Rota para obter o perfil do usuário autenticado(COM TOKEN!!)
router.get('/auth/profile', autenticarToken, async (req, res) =>{
  try{
    const userId = req.usuario.id; // Supondo que o ID do usuário esteja presente no token
    const user = await Usuario.findByPk(userId);

    if(!user){
      return res.status(404).json({error: "Usuário não encontrado"});
    }
    res.status(200).json({user : {
      id: user.id,
      nome: user.nome,
      email: user.email
    }});
  } catch (error){
    console.error("Erro ao buscar perfil do usuário:", error);
    res.status(500).json({error: "Erro interno do servidor"});
  }
});

// Rota para listar usuários (protegida por autenticação)
router.get('/listar', controllerRegister.listarUsuarios);

// Rota de provisória de produtos
router.post('/produtos/:idUsuario', controllerProduto.RegistrarProduto);
router.get('/produtos', controllerProduto.listarProdutos);

// Rota  de garantia
router.post('/garantias', controllerGarantia.RegistrarGarantia);
//listar garantia
router.get('/garantias', controllerGarantia.listarGarantias);
//listar Garantia por id
router.get('/garantias/:id', controllerGarantia.listarGarantiaPorId);
router.put('/garantias/:id', controllerGarantia.atualizarGarantia);
router.patch('/garantias/:id', controllerGarantia.atualizarStatusGarantia);
router.delete('/garantias/:id', controllerGarantia.excluirGarantia);


// Rota de Recuperação de Senha placeholder (a ser implementada)
/* router.post('/forgot-password', autenticarToken, (req, res) => {
  res.status(200).json({ message: 'Página de recuperação de senha',
    user: req.user
   })
}); */

module.exports = router;