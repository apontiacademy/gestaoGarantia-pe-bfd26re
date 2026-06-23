const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função para registrar um novo usuário
async function registerUser(req, res) {
  const { nomeCompleto, email, senha } = req.body;

  if (!nomeCompleto || !email || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres" });
  }

  const emailNormalizado = email.toLowerCase();

  try {
    const emailExistente = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (emailExistente) {
      return res.status(400).json({ error: "Email já registrado" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nomeCompleto,
      email: emailNormalizado,
      senha: hash
    });

    const token = jwt.sign(
      { id_usuario: novoUsuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(201).json({
      token,
      user: {
        id: novoUsuario.id,
        nomeCompleto: novoUsuario.nomeCompleto,
        email: novoUsuario.email,
        fotoPerfil: null,
      }
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: "Email já registrado" });
    }
    return res.status(500).json({ error: "Erro ao registrar usuário" });
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