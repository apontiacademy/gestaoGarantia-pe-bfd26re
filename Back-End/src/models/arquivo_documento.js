'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Arquivo_Documento extends Model {
    static associate(models) {
      this.belongsToMany(models.Documento_Fiscal, { through: 'Documento_Fiscal_Arquivo_Documento', foreignKey: 'arquivo_documento_id',as: 'documentos_fiscais' });
    }
  }

  Arquivo_Documento.init({
    origem: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data_upload: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Arquivo_Documento',
    tableName: 'Arquivos_Documentos',
  });

  return Arquivo_Documento;
};