const { Notificacao } = require('../models');

async function criarNotificacao(
  id_usuario,
  tipo,
  mensagem,
  garantia_id = null
) {
  try {
    return await Notificacao.create({
      id_usuario,
      garantia_id,
      tipo,
      mensagem,
      lida: false,
      data_envio: new Date()
    });
  } catch {
    // Notificação é secundária; falha não bloqueia a operação principal
  }
}

module.exports = {
  criarNotificacao
};