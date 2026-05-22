'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Grupo_Garantia extends Model {}
  Grupo_Garantia.init({
    grupo_id: DataTypes.INTEGER,
    garantia_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Grupo_Garantia',
    tableName: 'Grupo_Garantia',
  });
  return Grupo_Garantia;
};