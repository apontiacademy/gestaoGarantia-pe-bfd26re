const bcrypt = require('bcrypt');


const hashPassword = (senha) => bcrypt.hash(senha, 10);
const compararSenha = (senha, hash) => bcrypt.compare(senha, hash);

module.exports = { hashPassword, compararSenha };