'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Produtos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_usuario: {
         type: Sequelize.INTEGER,
          allowNull: false, // Opcional: impede produto sem dono
          references: {
            model: 'Usuarios', // Nome da tabela de destino exatamente como está no banco
            key: 'id'          // Coluna de destino
          },
          onUpdate: 'CASCADE', // Se o ID do usuário mudar, atualiza aqui também
          onDelete: 'CASCADE'  // Se o usuário for deletado, os produtos dele também serão
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false // Garantindo que o dado exista
      },
      marca: {
        type: Sequelize.STRING
      },
      modelo: {
        type: Sequelize.STRING
      },
      data_cadastro: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Produtos');
  }
};