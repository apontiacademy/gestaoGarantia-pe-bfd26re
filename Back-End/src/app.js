const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../.env') 
});

// Logs para debug
console.log("✅ .env carregado. DB_NAME =", process.env.DB_NAME ? "OK" : "FALTANDO");
console.log("✅ JWT_SECRET =", process.env.JWT_SECRET ? "OK" : "FALTANDO");

if (!process.env.DB_NAME || !process.env.JWT_SECRET) {
  console.error("❌ ERRO: Variáveis de ambiente obrigatórias não encontradas!");
  console.error("Verifique o arquivo .env");
  process.exit(1);
}

// ==================== IMPORTS ====================
const express = require('express');
const cors = require('cors');

const app = express();

// ==================== MIDDLEWARES ====================
app.use(express.json());

const normalizeOrigin = (origin) => origin.replace(/\/+$/, '');

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => normalizeOrigin(o.trim()))
  : ['https://gerenciador-de-garantia-aponti.netlify.app'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================== ROTA DE TESTE ====================
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API funcionando!',
    environment: process.env.NODE_ENV || 'production'
  });
});

// ==================== ROTAS ====================
const routes = require('./routes');
app.use(routes);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
const { runMigrations } = require('./utils/runMigrations');

async function startServer() {
  try {
    runMigrations();
  } catch (error) {
    console.error('❌ Falha ao executar migrations:', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

startServer();