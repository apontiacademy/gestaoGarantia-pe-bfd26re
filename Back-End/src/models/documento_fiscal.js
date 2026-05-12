'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documento_Fiscal extends Model {
    static associate(models) {
      // O documento pertence a um produto (1:1)
      this.belongsTo(models.Produto, { foreignKey: 'id_produto', as: 'produto' });
    }
  }
  Documento_Fiscal.init({
    id_produto: {
      type: DataTypes.INTEGER,
      primaryKey: true // Define como chave primária aqui também
    },
    cnpj_emissor: DataTypes.STRING,
    valor: DataTypes.DECIMAL(10, 2),
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