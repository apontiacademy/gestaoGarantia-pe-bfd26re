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
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'usuario' }); 
      // Associação com o modelo Usuario, usando id_usuario como chave estrangeira
      this.hasMany(models.Garantia, {foreignKey: 'produto_id', as:'garantias'});
      //  Associação com modelo Garantia
      this.hasOne(models.Documento_Fiscal, { foreignKey: 'produto_id', as: 'documento_fiscal' });
      //Associação com o modelo Documento Fiscal
    }
  }
  Produto.init({
    id_usuario: DataTypes.INTEGER,
    nome: DataTypes.STRING,
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    data_cadastro: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Produto',
    tableName: 'Produtos'
  });
  return Produto;
};