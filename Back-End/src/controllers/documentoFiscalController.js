const DocumentoFiscal = require('../models/documento_fiscal');
const calcularValorTotal = require('../utils/documentoFiscalUtil');

class DocumentoFiscalController {

    async create(req, res) {

        try {

            const {
                produto_id,
                cnpj_emissor,
                valor,
                quantidade,
                data_compra,
                numero_nf,
                serie_nota,
                chave_acesso,
                tipo
            } = req.body;

            const valorFinal = calcularValorTotal(valor, quantidade);

            const documentoFiscal = await DocumentoFiscal.create({
                produto_id,
                cnpj_emissor,
                valor: valorFinal,
                data_compra,
                numero_nf,
                serie_nota,
                chave_acesso,
                tipo
            });

            return res.status(201).json(documentoFiscal);

        } catch (error) {

            return res.status(500).json({
                erro: error.message
            });

        }
    }
}

module.exports = new DocumentoFiscalController();