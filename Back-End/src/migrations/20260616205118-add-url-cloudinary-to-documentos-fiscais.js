'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Documentos_Fiscais', 'urlCloudinary', {
      type: Sequelize.TEXT,
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    // Reverter a adição da coluna 'urlCloudinary'
    await queryInterface.removeColumn('Documentos_Fiscais', 'urlCloudinary');
  }
};