const{ Usuario } = require('../models');
const jwt = require('jsonwebtoken');
const{ compararSenha }= require("../utils/hash");

// Função para autenticar usuário e gerar token JWT
async function Login(req, res) {
    const { email, senha } = req.body;

    if(!email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const emailNormalizado = email.toLowerCase();

        let usuario;
    try{
        usuario = await Usuario.findOne({ where: { email: emailNormalizado } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao fazer login" });
    }

    const senhaValida = await compararSenha(senha, usuario.senha);

    if (!senhaValida) {
        return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    //AO FAZER LOGIN SO DEVE RETORNAR O TOKEN + INFORMAÇÔES BASICAS, NUNCA RETORNAR SENHA
    res.status(200).json({ token, usuario: 
        { id: usuario.id, nome: usuario.nome, email: usuario.email } });
}

module.exports = { Login };