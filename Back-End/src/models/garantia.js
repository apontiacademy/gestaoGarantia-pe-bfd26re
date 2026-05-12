'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Garantia extends Model {
    
    static associate(models) {
     
      this.belongsTo(models.Produto,{foreignKey:'produto_id', as: 'produtos'}); //Associal com model Produto
    }
  }
  Garantia.init({
    produto_id: DataTypes.INTEGER,
    prazo_dias: { type: DataTypes.INTEGER, allowNull: false, validate:{ min: 0 } },
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