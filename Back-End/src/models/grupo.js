'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Grupo extends Model {
    static associate(models) {
      this.belongsToMany(models.Produto, { through: 'Produto_Grupo', foreignKey: 'grupo_id',as: 'produtos' });
      //associação com produto
      this.belongsToMany(models.Garantia, { through: 'Grupo_Garantia', foreignKey: 'grupo_id',as: 'garantias' });
      //associação com grupo garantia
      this.belongsToMany(models.Documento_Fiscal, { through: 'Documento_Fiscal_Grupo', foreignKey: 'grupo_id',as: 'documentos_fiscais' });
      //associação com documento fiscal
    }
  }

  Grupo.init({
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    descricao: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Grupo',
    tableName: 'Grupos',
  });

  return Grupo;
};