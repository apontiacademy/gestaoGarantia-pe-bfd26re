'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documento_Fiscal_Arquivo_Documento', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      documento_fiscal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Documentos_Fiscais', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      arquivo_documento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Arquivos_Documentos', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documento_Fiscal_Arquivo_Documento');
  }
};