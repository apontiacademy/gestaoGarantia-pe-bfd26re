'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Garantia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Produto,{foreignKey:'produto_id', as: 'produto'}); 
      //Uma garantia pertence a um produto
    }
  }
  Garantia.init({
    produto_id: DataTypes.INTEGER,
    prazo_dias: DataTypes.INTEGER,
    data_inicio: DataTypes.DATEONLY,
    data_fim: DataTypes.DATEONLY,
    tipo: DataTypes.STRING,
    data_cadastro: DataTypes.DATE,
    observacao: DataTypes.TEXT,
    deletado_em: DataTypes.DATE,
    deletado_por: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Garantia',
    tableName: 'Garantias'
  });
  return Garantia;
};