'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Criar um Usuário
    await queryInterface.bulkInsert('Usuarios', [{
      id: 2,
      nomeCompleto: 'Admin Teste',
      email: 'admin2@teste.com',
      senha: '123',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // 2. Criar um Produto para o Usuário 1
    await queryInterface.bulkInsert('Produtos', [{
      id: 2,
      id_usuario: 2,
      nome: 'Geladeira Frost Free',
      marca: 'Electrolux',
      modelo: 'IF55',
      data_cadastro: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // 3. Criar o Documento Fiscal (1:1 - Herda o ID 1 do Produto)
    await queryInterface.bulkInsert('Documentos_Fiscais', [{
      produto_id: 2, // Herança do ID do Produto
      cnpj_emissor: '12345678000199',
      valor: 3500.00,
      data_compra: '2024-01-10',
      numero_nf: '000.123.456',
      tipo: 'Nota Fiscal Eletrônica',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // 4. Criar uma Garantia para o Produto 1
    await queryInterface.bulkInsert('Garantias', [{
      id_produto: 2,
      prazo_dias: 365,
      data_inicio: '2024-01-10',
      data_fim: '2025-01-10',
      tipo: 'Geral',
      observacao: 'Cobertura total para defeitos de fabricação.',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    // Ordem inversa para não quebrar as chaves estrangeiras ao deletar
    await queryInterface.bulkDelete('Garantias', null, {});
    await queryInterface.bulkDelete('Documentos_Fiscais', null, {});
    await queryInterface.bulkDelete('Produtos', null, {});
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};