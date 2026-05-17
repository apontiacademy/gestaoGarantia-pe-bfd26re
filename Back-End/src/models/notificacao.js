'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notificacao extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      this.belongsTo(models.Garantia, { foreignKey: 'garantia_id', as: 'garantia' });
    }
  }

  Notificacao.init({
    usuario_id: DataTypes.INTEGER,
    garantia_id: DataTypes.INTEGER,
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mensagem: DataTypes.TEXT,
    data_envio: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Notificacao',
    tableName: 'Notificacoes', 
  });

  return Notificacao;
};