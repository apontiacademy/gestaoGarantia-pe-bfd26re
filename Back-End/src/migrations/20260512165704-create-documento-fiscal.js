'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documentos_Fiscais', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, 
        references: {
          model: 'Produtos', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cnpj_emissor: {
        type: Sequelize.STRING(14), // CNPJ sem pontos/traços
        allowNull: false
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2), // evita erros de arredondamento
        allowNull: false
      },
      data_compra: {
        type: Sequelize.DATEONLY, // apenas a data
        allowNull: false
      },
      numero_nf: {
        type: Sequelize.STRING,
        allowNull: false
      },
      serie_nota: {
        type: Sequelize.STRING
      },
      chave_acesso: {
        type: Sequelize.STRING(44) // Chave padrão de NF-e
      },
      tipo: {
        type: Sequelize.STRING, // Ex: 'Nota Fiscal', 'Cupom'
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // CRITÉRIO DE ACEITAÇÃO: Data de compra não pode ser futura
    await queryInterface.addConstraint('Documentos_Fiscais', {
      fields: ['data_compra'],
      type: 'check',
      where: {
        data_compra: { [Sequelize.Op.lte]: Sequelize.literal('CURRENT_DATE') }
      },
      name: 'check_data_compra_nao_futura'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documentos_Fiscais');
  }
};