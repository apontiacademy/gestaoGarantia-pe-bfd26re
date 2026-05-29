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
                valorInformado,
                data_compra,
                numero_nf,
                serie_nota,
                chave_acesso,
                tipo
            } = req.body;

            const resultado = calcularValorTotal(valor, quantidade, valorInformado);

            const documentoFiscal = await DocumentoFiscal.create({
                produto_id,
                cnpj_emissor,
                valor_unitario: resultado.valor_unitario,
                valor: resultado.valor_total,
                quantidade: resultado.quantidade,
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