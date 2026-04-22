const { Produto, Usuario } = require('../models');

// Função para registrar um novo produto
async function RegistrarProduto(req, res) {
    const { idUsuario } = req.params;
    const { nome, marca, modelo } = req.body; 

    try{
        // Validação dos campos obrigatórios
        if(!idUsuario || !nome || !marca || !modelo) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        const usuario = await Usuario.findByPk(idUsuario);

        if(!usuario){
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const novoProduto = await Produto.create({
            idUsuario,
            nome,
            marca,
            modelo,
            data_cadastro: new Date()
        });
    } catch (error) {
        console.error("Erro ao registrar produto:", error);
        return res.status(500).json({ error: "Erro ao registrar produto" });
    } 
    return res.status(201).json({ message: "Produto registrado com sucesso" });
}

// Função para listar produtos (protegida por autenticação)
async function listarProdutos(req, res) {
    try{
        const produtos = await Produto.findAll({
            include: {
                model: Usuario,
                as: 'usuario',
                attributes: ['nomeCompleto', 'email']
            }
        });
        return res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        return res.status(500).json({ error: "Erro ao listar produtos" });
    }
}

module.exports = { RegistrarProduto, listarProdutos };