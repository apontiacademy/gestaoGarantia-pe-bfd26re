const { Produto, Usuario } = require('../models');

// Função para registrar um novo produto
async function RegistrarProduto(req, res) {
    const { id_usuario } = req.user;
    const { nome, marca, modelo } = req.body; 

    try{
        // Validação dos campos obrigatórios
        if(!id_usuario || !nome || !marca || !modelo) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        const usuario = await Usuario.findByPk(id_usuario);

        if(!usuario){
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const novoProduto = await Produto.create({
            id_usuario,
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

// Função para atualizar um produto (protegida por autenticação)
async function atualizarProduto(req, res) {
    const { id } = req.params;
    const { nome, marca, modelo } = req.body;

    try {
        const produto = await Produto.findByPk(id);
        if (!produto) {
            return res.status(404).json({ error: "Produto não encontrado" });
        }

        await produto.update({ nome, marca, modelo });
        return res.status(200).json({ message: "Produto atualizado com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        return res.status(500).json({ error: "Erro ao atualizar produto" });
    }

}

// Função para atualizar um atributo específico do produto (protegida por autenticação)
async function atualizarStatusProduto(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const produto = await Produto.findByPk(id);
        if (!produto) {
            return res.status(404).json({ error: "Produto não encontrado" });
        }
        await produto.update({ status });
        return res.status(200).json({ message: "Status do produto atualizado com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar status do produto:", error);
        return res.status(500).json({ error: "Erro ao atualizar status do produto" });
    }
}

// Função para excluir um produto (protegida por autenticação) 
async function excluirProduto(req, res) {
    const { id } = req.params;

    try {
        const produto = await Produto.findByPk(id);
        if (!produto) {
            return res.status(404).json({ error: "Produto não encontrado" });
        }

        await produto.destroy();
        return res.status(200).json({ message: "Produto excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        return res.status(500).json({ error: "Erro ao excluir produto" });
    }
}

module.exports = { RegistrarProduto, listarProdutos, atualizarProduto, atualizarStatusProduto, excluirProduto };