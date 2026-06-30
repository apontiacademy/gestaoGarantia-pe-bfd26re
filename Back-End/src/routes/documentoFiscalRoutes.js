const express = require('express');
const router = express.Router();

const documentoFiscalController = require('../controllers/documentoFiscalController');

router.post('/documento-fiscal',documentoFiscalController.create);
router.put('/documento-fiscal/:produto_id', documentoFiscalController.update);

module.exports = router;