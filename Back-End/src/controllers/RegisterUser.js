const{Usuario} = require('../models');
const bcrypt = require('bcrypt');

// Função para registrar um novo usuário
async function registerUser(req, res) {
  const { nomeCompleto, email, senha } = req.body;

    const emailNormalizado = email.toLowerCase();

      if (!nomeCompleto || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const emailExistente = await Usuario.findOne({ where: { email: emailNormalizado } }); // Verificar se o email já existe no banco de dados
    if (emailExistente) {
        return res.status(400).json({ error: "Email já registrado" });
    }
  
  try {
    const novoUsuario = await Usuario.create({
      nomeCompleto,
      email : emailNormalizado,
      senha : hash
    });

    res.status(201).json({
      nomeCompleto: novoUsuario.nomeCompleto,
      email: novoUsuario.email,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);

    if(error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: "Email já registrado" });
    }
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}

// Função para listar usuários (protegida por autenticação)
async function listarUsuarios(req, res) {
    try{
        const usuarios = await Usuario.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ error: "Erro ao listar usuários" });
    }
}
module.exports = { registerUser, listarUsuarios };