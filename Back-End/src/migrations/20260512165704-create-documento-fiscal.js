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
    await queryInterface.sequelize.query(
      'ALTER TABLE "Documentos_Fiscais" ADD CONSTRAINT "check_data_compra_nao_futura" CHECK (data_compra <= CURRENT_DATE)'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documentos_Fiscais');
  }
};