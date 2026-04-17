const express = require('express');
const controllerLogin = require('../controllers/loginAuth');

const route = express.Router();

route.post('/auth/login', controllerLogin.Login);

module.exports = route; 