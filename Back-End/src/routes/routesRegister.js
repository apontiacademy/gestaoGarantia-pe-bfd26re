const express = require('express');
const controller = require('../controllers/RegisterUser');

const routes = express.Router();

routes.post('/auth/register', controller.registerUser);
routes.get('/listar', controller.listarUsuarios);

module.exports = routes; 