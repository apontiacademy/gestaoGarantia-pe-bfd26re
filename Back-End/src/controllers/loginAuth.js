const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const { compararSenha } = require("../utils/hash");

async function Login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const emailNormalizado = email.toLowerCase();
    const usuario = await Usuario.findOne({ where: { email: emailNormalizado } });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await compararSenha(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Token com duração maior (8h) + retorno do usuário
    const token = jwt.sign(
      { idUsuario: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Retorna token + dados básicos do usuário (nunca a senha)
    return res.status(200).json({
      token,
      user: {
        id: usuario.id,
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
      }
    });

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}

module.exports = { Login };