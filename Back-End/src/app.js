const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Logs para debug
console.log(".env carregado. DB_NAME =", process.env.DB_NAME ? "OK" : "FALTANDO");
console.log("JWT_SECRET =", process.env.JWT_SECRET ? "OK" : "FALTANDO");

if (!process.env.DB_NAME || !process.env.JWT_SECRET) {
  console.error("ERRO: Variáveis de ambiente obrigatórias não encontradas!");
  console.error("Verifique se o arquivo .env existe em:", path.resolve(__dirname, '../.env'));
  // Não usar process.exit(1) em ambiente de desenvolvimento com nodemon
  // process.exit(1); 
}

const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).send({ message: 'API funcionando!' });
});

// Rotas
const routes = require('./routes');
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});