'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Produto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Usuario, { foreignKey: 'idUsuario', as: 'usuario' }); // Associação com o modelo Usuario, usando idUsuario como chave estrangeira
      this.hasMany(models.Garantia, {foreignKey: 'produto_id', as:'garantia'}); //  Associação com modelo Garantia
    }
  }
  Produto.init({
    idUsuario: DataTypes.INTEGER,
    nome: DataTypes.STRING,
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    data_cadastro: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Produto',
  });
  return Produto;
};