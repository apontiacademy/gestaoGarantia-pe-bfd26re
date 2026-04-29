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
      // define association here
      this.belongsTo(models.Produto,{foreignKey:'produto_id', as: 'produto'}); //Associal com model Produto
    }
  }
  Garantia.init({
    produto_id: DataTypes.INTEGER,
    prazo_dias: DataTypes.INTEGER,
    data_inicio: DataTypes.DATE,
    data_fim: DataTypes.DATE,
    tipo: DataTypes.STRING,
    data_cadastro: DataTypes.DATE,
    observacao: DataTypes.STRING,
    deletado_em: DataTypes.DATE,
    deletado_por: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Garantia',
    tableName: 'Garantias'
  });
  return Garantia;
};