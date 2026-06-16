const { Notificacao } = require('../models');

async function criarNotificacao(
  id_usuario,
  tipo,
  mensagem,
  garantia_id = null
) {

  return await Notificacao.create({
    id_usuario,
    garantia_id,
    tipo,
    mensagem,
    lida: false,
    data_envio: new Date()
  });

}

module.exports = {
  criarNotificacao
};