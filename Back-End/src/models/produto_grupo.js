'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Produto_Grupo extends Model {}

  Produto_Grupo.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Produtos', key: 'id' }
    },
    grupo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Grupos', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'Produto_Grupo',
    tableName: 'Produto_Grupo',
  });

  return Produto_Grupo;
};