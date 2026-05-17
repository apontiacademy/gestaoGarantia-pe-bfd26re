const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const { compararSenha } = require("../utils/hash");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


//Para envio de email, utilizando o Nodemailer e Gmail. LEMBRAR DE CONFIGURAR AS CREDENCIAIS DO NODE MAILER VIA GMAIL!!
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
})

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

    // Token com duração maior (8h) + retorno do usuário
    const token = jwt.sign(
      { id_usuario: usuario.id },
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

async function AlterarSenha(req, res) {
const { senha, novaSenha } = req.body;
const id_usuario = req.usuario.id_usuario; // ID do usuário autenticado

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
        try{
            const usuario = await Usuario.findOne({ where: { email } });

            if (!usuario) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }

            const tokenReset = jwt.sign({id_usuario: usuario.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

            const linkReset = `http://localhost:3000/resetar-senha?token=${tokenReset}`;

            await transporter.sendMail({
                from: '"Suporte"<process.env.EMAIL_USER>,',
                to: usuario.email,
                subject: "Recuperação de senha",
                text: `Clique no link para resetar sua senha: ${linkReset}`,
                html: `<p>Solicitação de recuperação de senha, link valido por 15 minutos: <a href="${linkReset}">Resetar Senha</a></p>`
            });

            res.status(200).json({ message: "Email de recuperação enviado" });
        } catch(err){
        console.error("Erro ao processar solicitação de recuperação de senha:", err);
        res.status(500).json({ error: "Erro ao processar solicitação de recuperação de senha" });
    } 
}

async function ResetarSenha(req, res) {
  const { token, novaSenha } = req.body; // Token recebido do cliente + nova senha
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const usuario = await Usuario.findByPk(decoded.id_usuario);

    if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    usuario.senha = await bcrypt.hash(novaSenha, 10);
    await usuario.save();

    res.status(200).json({ message: "Senha ALTERADA com sucesso" });
    }  catch(err){
    console.error("Erro ao resetar senha:", err);
    res.status(500).json({ error: "Erro ao resetar senha" });
}
}

module.exports = { Login, AlterarSenha, EsqueciSenha, ResetarSenha };