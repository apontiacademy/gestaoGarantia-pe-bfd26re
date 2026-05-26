const { Usuario } = require('../models');

// Busca dados do usuário logado
async function BuscarPerfil(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.user.id_usuario || req.user.id, {
      attributes: ['id', 'nomeCompleto', 'email', 'fotoPerfil']
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
}

// Atualiza nome e/ou foto do usuário logado
async function AtualizarPerfil(req, res) {
  try {
    const { nomeCompleto, fotoPerfil } = req.body;

    const usuario = await Usuario.findByPk(req.user.id_usuario || req.user.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await usuario.update({ nomeCompleto, fotoPerfil });

    return res.status(200).json({
      id: usuario.id,
      nomeCompleto: usuario.nomeCompleto,
      email: usuario.email,
      fotoPerfil: usuario.fotoPerfil,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
}

module.exports = { BuscarPerfil, AtualizarPerfil };