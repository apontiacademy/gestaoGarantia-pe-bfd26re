'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.addColumn('Documentos_Fiscais', 'quantidade', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

     await queryInterface.addColumn('Documentos_Fiscais', 'valor_unitario', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Documentos_Fiscais', 'quantidade');
    await queryInterface.removeColumn('Documentos_Fiscais', 'valor_unitario');
  }
};