require('dotenv').config();

const jwt = require('jsonwebtoken');

// Verificação básica para garantir que as variáveis de ambiente estão carregadas
if (!process.env.DB_NAME) {
  console.error("❌ ERRO: Arquivo .env não encontrado ou variáveis de banco faltando!");
  process.exit(1); // Para a execução do Node
}

// Verificação do JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("❌ ERRO: Variável de ambiente JWT_SECRET não encontrada!");
  process.exit(1);
}


const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');

// Middleware para ler JSON no corpo das requisições
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).send({ message: 'API funcionando!' });
});

// Rotas de autenticação
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

