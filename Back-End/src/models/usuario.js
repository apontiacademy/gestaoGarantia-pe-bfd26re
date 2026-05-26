'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      this.hasMany(models.Produto, { foreignKey: 'id_usuario', as: 'produtos' });
      this.hasMany(models.Notificacao, { foreignKey: 'usuario_id', as: 'notificacoes' });
    }
  }

  Usuario.init({
    nomeCompleto: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    senha: DataTypes.STRING,
    
    fotoPerfil: {
      type: DataTypes.STRING,
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios'
  });

  return Usuario;
};