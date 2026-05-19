// Importação dos modelos
const { garantia_estendida, Garantia } = require('../models');
const { calcularStatusApolice } = require('../utils/garantiaEstendidaUtils'); 

async function registrarGarantiaEstendida(req, res) {
  try {
    const { garantia_id, numero_apolice, nome_seguradora, valor } = req.body;

    // Validação de campos obrigatórios conforme image_cc4c1e.jpg
    if (!garantia_id || !numero_apolice || !nome_seguradora) {
      return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
    }

    if (isNaN(valor) || valor < 0) {
      return res.status(400).json({ erro: 'O valor da garantia estendida não pode ser negativo' });
    }

    // Verifica se a garantia pai existe
    const garantiaPai = await Garantia.findByPk(garantia_id);
    if (!garantiaPai) {
      return res.status(404).json({ erro: 'Garantia principal não encontrada' });
    }

    const garantiaEstendida = await garantia_estendida.create({
      garantia_id,
      numero_apolice,
      nome_seguradora,
      valor
    });

    return res.status(201).json(garantiaEstendida);
  } catch (error) {
    console.error("Erro ao registrar garantia estendida:", error);
    return res.status(500).json({ erro: error.message });
  }
}

async function listarGarantiasEstendidas(req, res) {
  try {
    const garantias = await garantia_estendida.findAll({
      include: [
        {
          model: Garantia,
          as: 'garantia'
        }
      ]
    });

    return res.json(garantias);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarGarantiaEstendidaPorId(req, res) {
  try {
    const { id } = req.params;

    const garantia = await garantia_estendida.findByPk(id, {
      include: [{ model: Garantia, as: 'garantia' }]
    });

    if (!garantia) {
      return res.status(404).json({ mensagem: 'Garantia estendida não encontrada' });
    }

    // Passamos a data correspondente para calcular o status da apólice
    const infoGarantiaEstendida = calcularStatusApolice(garantia.data_fim); 

    // Retorna o JSON combinando os dados do banco com as informações calculadas
    return res.json({
      ...garantia.toJSON(),
      ...infoGarantiaEstendida
    });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function atualizarGarantiaEstendida(req, res) {
  try {
    const { id } = req.params;
    const { numero_apolice, nome_seguradora, valor } = req.body;

    if (valor !== undefined && (isNaN(valor) || valor < 0)) {
      return res.status(400).json({ erro: 'O valor não pode ser negativo' });
    }

    const registro = await garantia_estendida.findByPk(id);
    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro não encontrado' });
    }

    await garantia_estendida.update({
      numero_apolice,
      nome_seguradora,
      valor
    }, {
      where: { id_garantia_estendida: id }
    });

    const atualizada = await garantia_estendida.findByPk(id);
    return res.json(atualizada);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function excluirGarantiaEstendida(req, res) {
  try {
    const { id } = req.params;

    // No diagrama image_cc4c1e.jpg, essa tabela não mostra campos de 'soft delete' 
    // como a tabela Garantia, mas seguindo o padrão de segurança:
    const deletado = await garantia_estendida.destroy({
      where: { id_garantia_estendida: id }
    });

    if (!deletado) {
      return res.status(404).json({ mensagem: 'Registro não encontrado' });
    }

    return res.json({ mensagem: 'Garantia estendida excluída com sucesso' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = {
  registrarGarantiaEstendida,
  listarGarantiasEstendidas,
  listarGarantiaEstendidaPorId,
  atualizarGarantiaEstendida,
  excluirGarantiaEstendida
};