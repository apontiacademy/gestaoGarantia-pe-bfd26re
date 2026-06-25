// Importação dos modelos
const { GarantiaEstendida, Garantia } = require('../models');
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

    const garantiaEstendida = await GarantiaEstendida.create({
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
    const garantias = await GarantiaEstendida.findAll({
      include: [
        {
          model: Garantia,
          as: 'garantia_base'
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

    const garantia = await GarantiaEstendida.findByPk(id, {
      include: [{ model: Garantia, as: 'garantia_base' }]
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

async function listarGarantiasEstendidaApagadas(req, res) {
  try {

    const garantias = await GarantiaEstendida.findAll({
      where: {
        deletado_em: {
          [Op.ne]: null
        }
      }
    });

    return res.json(garantias);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

async function atualizarGarantiaEstendida(req, res) {
  try {
    const { id } = req.params;
    const { numero_apolice, nome_seguradora, valor } = req.body;

    if (valor !== undefined && (isNaN(valor) || valor < 0)) {
      return res.status(400).json({ erro: 'O valor não pode ser negativo' });
    }

    const registro = await GarantiaEstendida.findOne({ where: { garantia_id: id } });
    if (!registro) {
      return res.status(404).json({ mensagem: 'Registro não encontrado' });
    }

    await GarantiaEstendida.update({
      numero_apolice,
      nome_seguradora,
      valor
    }, {
      where: { garantia_id: id }
    });

    const atualizada = await GarantiaEstendida.findOne({ where: { garantia_id: id } });
    return res.json(atualizada);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function atualizarStatusGarantiaEstendida(req, res) {
  try {
    const { id } = req.params;
    const garantia = await GarantiaEstendida.findByPk(id);

    if (!garantia) {
      return res.status(404).json({ mensagem: 'Garantia estendida não encontrada' });
    }
      const infoGarantiaEstendida = calcularStatusApolice(garantia.data_fim);
      return res.json({
        ...garantia.toJSON(),
        ...infoGarantiaEstendida
      });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}


async function excluirGarantiaEstendida(req, res) {
  try {
    const { id } = req.params;
    const deletado = await GarantiaEstendida.destroy({
      where: { garantia_id: id }
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
  listarGarantiasEstendidaApagadas,
  atualizarGarantiaEstendida,
  atualizarStatusGarantiaEstendida,
  excluirGarantiaEstendida
};