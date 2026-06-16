'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documento_Fiscal extends Model {
    static associate(models) {
      // O documento pertence a um produto (1:1)
      this.belongsTo(models.Produto, { foreignKey: 'produto_id', as: 'produto' });
      this.belongsToMany(models.Arquivo_Documento, { through: 'Documento_Fiscal_Arquivo_Documento', foreignKey: 'documento_fiscal_id',as: 'arquivos' });
    }
  }
  Documento_Fiscal.init({
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
    },
    produto_id: {
      type: DataTypes.INTEGER,
      primaryKey: true // Define como chave primária aqui também
    },
    cnpj_emissor: DataTypes.STRING,
    valor: DataTypes.DECIMAL(10, 2),
     quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  valor_unitario: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    defaultValue: 0
  },
  urlCloudinary: {
  type: DataTypes.TEXT,
  allowNull: true,
  validate: {
    isUrl: {
      msg: "O link do Cloudinary fornecido não é uma URL válida."
      }
    }
  },
    data_compra: DataTypes.DATEONLY,
    numero_nf: DataTypes.STRING,
    serie_nota: DataTypes.STRING,
    chave_acesso: DataTypes.STRING,
    tipo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Documento_Fiscal',
    tableName: 'Documentos_Fiscais'
  });
  return Documento_Fiscal;
};