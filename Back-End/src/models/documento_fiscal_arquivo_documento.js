'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Documento_Fiscal_Arquivo_Documento extends Model {
    static associate(models) {
      this.belongsTo(models.Documento_Fiscal, { foreignKey: 'documento_fiscal_id' });
      this.belongsTo(models.Arquivo_Documento, { foreignKey: 'arquivo_documento_id' });
    }
  }

  Documento_Fiscal_Arquivo_Documento.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    documento_fiscal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Documentos_Fiscais',
        key: 'id'
      }
    },
    arquivo_documento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Arquivos_Documentos',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Documento_Fiscal_Arquivo_Documento',
    tableName: 'Documento_Fiscal_Arquivo_Documento', 

  });

  return Documento_Fiscal_Arquivo_Documento;
};