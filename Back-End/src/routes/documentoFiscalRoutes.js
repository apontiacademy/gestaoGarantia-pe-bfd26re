const express = require('express');
const router = express.Router();

const documentoFiscalController = require('../controllers/documentoFiscalController');

router.post('/documento-fiscal',documentoFiscalController.create);

module.exports = router;