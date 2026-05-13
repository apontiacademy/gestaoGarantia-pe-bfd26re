const express = require('express');
const router = express.Router();

// Importação das rotas da aplicação
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const equipmentRoutes = require('./equipment.routes');
const garantiaRoutes = require('./garantia.routes');

// Registro das rotas
router.use(authRoutes);
router.use(userRoutes);
router.use(equipmentRoutes);
router.use(garantiaRoutes);

module.exports = router;