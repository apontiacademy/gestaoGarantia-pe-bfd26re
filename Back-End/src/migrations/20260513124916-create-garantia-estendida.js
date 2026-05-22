'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Garantias_Estendidas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      garantia_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // Garante que uma garantia só tenha UMA estendida
        references: {
          model: 'Garantias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      numero_apolice: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nome_seguradora: {
        type: Sequelize.STRING,
        allowNull: false
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Garantias_Estendidas');
  }
};