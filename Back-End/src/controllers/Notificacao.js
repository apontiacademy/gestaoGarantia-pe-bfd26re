const { Notificacao } = require('../models');

async function listar(req, res) {
  try {

    const usuarioId =
      req.user.idUsuario ||
      req.user.id;

    const notificacoes = await Notificacao.findAll({
      where: {
        id_usuario: usuarioId
      },
      order: [['createdAt', 'DESC']]
    });

    return res.json(notificacoes);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

async function marcarComoLida(req, res) {
  try {

    const { id } = req.params;

    await Notificacao.update(
      { lida: true },
      {
        where: { id }
      }
    );

    return res.json({
      mensagem: 'Notificação marcada como lida'
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

async function marcarTodasComoLidas(req, res) {
  try {

    const usuarioId =
      req.user.idUsuario ||
      req.user.id;

    await Notificacao.update(
      { lida: true },
      {
        where: {
          id_usuario: usuarioId
        }
      }
    );

    return res.json({
      mensagem: 'Todas as notificações foram lidas'
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

async function limparTodas(req, res) {
  try {

    const usuarioId =
      req.user.idUsuario ||
      req.user.id;

    await Notificacao.destroy({
      where: {
        id_usuario: usuarioId
      }
    });

    return res.json({
      mensagem: 'Notificações removidas'
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

module.exports = {
  listar,
  marcarComoLida,
  marcarTodasComoLidas,
  limparTodas
};