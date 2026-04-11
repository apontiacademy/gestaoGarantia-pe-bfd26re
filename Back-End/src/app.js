require('dotenv').config();

// Verificação básica para garantir que as variáveis de ambiente estão carregadas
if (!process.env.DB_NAME) {
  console.error("❌ ERRO: Arquivo .env não encontrado ou variáveis de banco faltando!");
  process.exit(1); // Para a execução do Node
}

const express = require('express');
const app = express();

// Middleware para ler JSON no corpo das requisições
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).send({ message: 'API funcionando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

