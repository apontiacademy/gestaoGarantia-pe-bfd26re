const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { compararSenha } = require("../utils/hash");
const SibApiV3Sdk = require('sib-api-v3-sdk');

const sibClient = SibApiV3Sdk.ApiClient.instance;
sibClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ── Função interna de envio de email ─────────────────────
async function enviarEmail(destinatario, codigo) {
  const email = new SibApiV3Sdk.SendSmtpEmail();

  email.subject = 'Código de Verificação - Aponti';
  email.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Redefinição de senha</h2>
      <p>Utilize o código abaixo para redefinir sua senha:</p>
      <h1 style="font-size: 32px; letter-spacing: 8px; color: #6d28d9; text-align: center; margin: 20px 0;">
        ${codigo}
      </h1>
      <p style="color: #666; font-size: 14px;">
        Este código é válido por <strong>20 minutos</strong>.<br>
        Se você não solicitou esta redefinição, ignore este email.
      </p>
    </div>
  `;
  email.sender = { name: 'Aponti', email: 'gabrifelipegf@gmail.com' };
  email.to = [{ email: destinatario }];

  await transactionalApi.sendTransacEmail(email);
}

// ── Login ─────────────────────────────────────────────────
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

    const token = jwt.sign(
      { id_usuario: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: usuario.id,
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
        fotoPerfil: usuario.fotoPerfil ?? null,
      }
    });

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}

// ── Alterar senha (usuário logado) ────────────────────────
async function AlterarSenha(req, res) {
  const { senha, novaSenha } = req.body;
  const id_usuario = req.user.id_usuario;

  if (!senha || !novaSenha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ error: "A nova senha deve ter no mínimo 6 caracteres" });
  }

  try {
    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    usuario.senha = await bcrypt.hash(novaSenha, 10);
    await usuario.save();

    return res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ error: "Erro ao alterar senha" });
  }
}

// ── Esqueci minha senha ───────────────────────────────────
async function EsqueciSenha(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!usuario) {
      return res.status(200).json({ message: "Código de recuperação enviado" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const resetToken = jwt.sign(
      {
        id_usuario: usuario.id,
        email: usuario.email,
        codigo: resetCode,
        tipo: "reset_password"
      },
      process.env.JWT_SECRET,
      { expiresIn: '20m' }
    );

    await enviarEmail(usuario.email, resetCode);

    return res.status(200).json({
      message: "Código de recuperação enviado",
      resetToken
    });

  } catch (err) {
    console.error("Erro ao processar EsqueciSenha:", err);
    return res.status(500).json({ error: "Erro ao enviar código de recuperação" });
  }
}

// ── Verificar código de reset ─────────────────────────────
async function VerificarCodigoReset(req, res) {
  const { token, codigo } = req.body;

  if (!token || !codigo) {
    return res.status(400).json({ error: "Token e código são obrigatórios" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tipo !== "reset_password") {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (decoded.codigo !== codigo.trim()) {
      return res.status(401).json({ error: "Código incorreto" });
    }

    return res.status(200).json({
      message: "Código válido",
      token
    });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Código expirado. Solicite um novo." });
    }
    return res.status(401).json({ error: "Código inválido" });
  }
}

// ── Resetar senha ─────────────────────────────────────────
async function ResetarSenha(req, res) {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha) {
    return res.status(400).json({ error: "Token e nova senha são obrigatórios" });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tipo !== "reset_password") {
      return res.status(401).json({ error: "Token inválido" });
    }

    const usuario = await Usuario.findByPk(decoded.id_usuario);
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    usuario.senha = await bcrypt.hash(novaSenha, 10);
    await usuario.save();

    return res.status(200).json({ message: "Senha redefinida com sucesso" });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Sessão expirada. Solicite um novo código." });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = { Login, AlterarSenha, VerificarCodigoReset, EsqueciSenha, ResetarSenha };