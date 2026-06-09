'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GarantiaEstendida extends Model {
    static associate(models) {
      // Relacionamento 1:1 - Esta tabela "pertence a" uma Garantia
      this.belongsTo(models.Garantia, { 
        foreignKey: 'garantia_id', 
        as: 'garantia_base' 
      });
    }
  }

  GarantiaEstendida.init({
    garantia_id: DataTypes.INTEGER,
    numero_apolice: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nome_seguradora: {
      type: DataTypes.STRING,
      allowNull: false
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'GarantiaEstendida',
    tableName: 'Garantias_Estendidas',
  });

  return GarantiaEstendida;
};