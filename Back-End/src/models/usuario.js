'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //um usuário tem muitos produtos
      this.hasMany(models.Produto, { foreignKey: 'id_usuario', as: 'produtos' });
      this.hasMany(models.Notificacao, { foreignKey: 'usuario_id', as: 'notificacoes' });
    }
  }
  Usuario.init({
    nomeCompleto: DataTypes.STRING,
    email : {
      type: DataTypes.STRING,
      unique: true // Reflete a regra de negócio
    },
    senha: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios'
  });
  return Usuario;
};