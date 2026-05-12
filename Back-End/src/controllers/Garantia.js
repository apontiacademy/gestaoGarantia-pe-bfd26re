const { Garantia, Produto } = require('../models');
const {calcularStatusGarantia} = require('../utils/garantiaUtils');

async function RegistrarGarantia(req, res) {
  try {
    const { produto_id, prazo_dias, data_inicio, tipo, observacao } = req.body;

      if (isNaN(prazo_dias) || prazo_dias < 0) {
        return res.status(400).json({ erro: 'O prazo da garantia não pode ser negativo' });
      }

    const tiposValidos = ['Normal', 'Estendida'];

    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json({ 
        erro: 'Tipo inválido',
        tiposAceitos: tiposValidos 
      });  
    }

    const dataFim = new Date(data_inicio);
    dataFim.setDate(dataFim.getDate() + prazo_dias);

    const garantia = await Garantia.create({
      produto_id,
      prazo_dias,
      data_inicio,
      data_fim: dataFim,
      tipo,
      observacao,
      data_cadastro: new Date()
    });

    return res.status(201).json(garantia);
  } catch (error) {
    console.error("Erro ao registrar garantia:", error);
    return res.status(500).json({ erro: error.message });
  }
}

async function listarGarantias(req, res) {
  try {
    const garantias = await Garantia.findAll({
      where: { deletado_em: null },
      include: [
        {
          model: Produto,
          as: 'produtos'
        }
      ]
    });

      const garantiasComStatus = garantias.map((garantia) => {

      const infoGarantia = calcularStatusGarantia(
        garantia.data_fim
      );

      return {
        ...garantia.toJSON(),
        ...infoGarantia
      };

    });

    return res.json(garantiasComStatus);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarGarantiaPorId(req, res) {
  try {
    const { id } = req.params;

    const garantia = await Garantia.findOne({
      where: { id, deletado_em: null },
      include: [
        {
          model: Produto,
          as: 'produtos'
        }
      ]
    });

    if (!garantia) {
      return res.status(404).json({ mensagem: 'Garantia não encontrada' });
    }

    const infoGarantia = calcularStatusGarantia(
      garantia.data_fim
    );

    return res.json({
      ...garantia.toJSON(),
      ...infoGarantia
    });

    // return res.json(garantia);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function atualizarGarantia(req, res) {
  try {
    const { id } = req.params;
    const { produto_id, prazo_dias, data_inicio, tipo, observacao } = req.body;

    if (isNaN(prazo_dias) || prazo_dias < 0) {
  return res.status(400).json({
    erro: 'O prazo da garantia não pode ser negativo'
  });
}

    const tiposValidos = ['Normal', 'Estendida'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json({ 
        erro: 'Tipo inválido',
        tiposAceitos: tiposValidos 
      });
    }

    const dataFim = new Date(data_inicio);
    dataFim.setDate(dataFim.getDate() + prazo_dias);

    await Garantia.update({
      produto_id,
      prazo_dias,
      data_inicio,
      data_fim: dataFim,
      tipo,
      observacao
    }, {
      where: { id }
    });

    const garantiaAtualizada = await Garantia.findByPk(id);
    return res.json(garantiaAtualizada);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function atualizarStatusGarantia(req, res) {
  try {
    const { id } = req.params;
    const dados = req.body;

    if (dados.prazo_dias !== undefined && (isNaN(dados.prazo_dias) || dados.prazo_dias < 0)) {
      return res.status(400).json({ erro: 'O prazo da garantia não pode ser negativo' });
    }


    const tiposValidos = ['Normal', 'Estendida'];
    if (dados.tipo && !tiposValidos.includes(dados.tipo)) {
      return res.status(400).json({ 
        erro: 'Tipo inválido',
        tiposAceitos: tiposValidos 
      });
    }

    const garantia = await Garantia.findByPk(id);
    if (!garantia) {
      return res.status(404).json({ mensagem: 'Garantia não encontrada' });
    }

    if (dados.prazo_dias || dados.data_inicio) {
      const dataInicio = dados.data_inicio || garantia.data_inicio;
      const prazo = dados.prazo_dias || garantia.prazo_dias;

      const dataFim = new Date(dataInicio);
      dataFim.setDate(dataFim.getDate() + prazo);
      dados.data_fim = dataFim;
    }

    await Garantia.update(dados, { where: { id } });

    const garantiaAtualizada = await Garantia.findByPk(id);
    return res.json(garantiaAtualizada);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function excluirGarantia(req, res) {
  try {
    const { id } = req.params;

    await Garantia.update({
      deletado_em: new Date(),
      deletado_por: 'sistema'
    }, {
      where: { id }
    });

    return res.json({ mensagem: 'Garantia excluída com sucesso' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = {
  RegistrarGarantia,
  listarGarantias,
  listarGarantiaPorId,
  atualizarGarantia,
  atualizarStatusGarantia,
  excluirGarantia
};