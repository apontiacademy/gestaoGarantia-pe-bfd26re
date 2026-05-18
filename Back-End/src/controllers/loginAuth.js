const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

async function Login(req, res) {
  const { email, senha } = req.body; // Recebe email e senha do cliente

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
      }
    });

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}

async function AlterarSenha(req, res) {
const { senha, novaSenha } = req.body;
const id_usuario = req.usuario.id_usuario;

 try{
        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha incorreta" });
        }
        usuario.senha =  await bcrypt.hash(novaSenha, 10);
        await usuario.save();

        res.status(200).json({ message: "Senha alterada com sucesso" });
    } catch(error){
        res.status(500).json({ error: "Erro ao alterar senha" });
    }
}

async function EsqueciSenha(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  try {
    const usuario = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    // Por segurança é melhor sempre retornar 200
    if (!usuario) {
      return res.status(200).json({ message: "Código de recuperação enviado" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const resetToken = jwt.sign(
      { 
        id_usuario: usuario.id,
        email: usuario.email,
        tipo: "reset_password"
      },
      process.env.JWT_SECRET,
      { expiresIn: '20m' } 
    );

    await transporter.sendMail({
      from: `"Suporte Aponti" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: 'Código de Recuperação - Aponti',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Seu código de recuperação</h2>
          <p>Utilize o código abaixo para redefinir sua senha:</p>
          
          <h1 style="font-size: 32px; letter-spacing: 8px; color: #3b82f6; text-align: center; margin: 20px 0;">
            ${resetCode}
          </h1>
          
          <p style="color: #666; font-size: 14px;">
            Este código é válido por <strong>20 minutos</strong>.<br>
            Se você não solicitou esta redefinição, ignore este email.
          </p>
        </div>
      `  
    });

    // Retorna o token pro frontend usar depois
    res.status(200).json({ 
      message: "Código de recuperação enviado",
      resetToken
    });

  } catch (err) {
    console.error("Erro ao processar EsqueciSenha:", err);
    res.status(500).json({ error: "Erro ao enviar código de recuperação" });
  }
}

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

    // Aqui a gente pode adicionar validação extra quando salvar o código no banco

    res.status(200).json({ 
      message: "Código válido",
      token  // devolve o msm token pra usar no reset
    });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Código expirado. Solicite um novo." });
    }
    res.status(401).json({ error: "Código inválido" });
  }
}

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

    const usuario = await Usuario.findByPk(decoded.id_usuario);

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    usuario.senha = await bcrypt.hash(novaSenha, 10);
    await usuario.save();

    res.status(200).json({ message: "Senha alterada com sucesso" });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Sessão expirada. Solicite um novo código." });
    }
    res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = { Login, AlterarSenha, VerificarCodigoReset, EsqueciSenha, ResetarSenha };