'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documento_Fiscal_Grupo');
    await queryInterface.dropTable('Grupo_Garantia');
    await queryInterface.dropTable('Produto_Grupo');
    await queryInterface.dropTable('Grupos');
  },

  async down(queryInterface, Sequelize) {
    // Não implementado
  }
};