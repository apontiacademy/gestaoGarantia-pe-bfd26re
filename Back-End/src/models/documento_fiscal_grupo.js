'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Documento_Fiscal_Grupo extends Model {}

  Documento_Fiscal_Grupo.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    documento_fiscal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Documentos_Fiscais', key: 'id' }
    },
    grupo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Grupos', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'Documento_Fiscal_Grupo',
    tableName: 'Documento_Fiscal_Grupo',
  });

  return Documento_Fiscal_Grupo;
};