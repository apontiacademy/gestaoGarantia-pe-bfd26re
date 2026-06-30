const {Documento_Fiscal} = require('../models');
const {calcularValorTotal} = require('../utils/documentoFiscalUtil');

class DocumentoFiscalController {

    async create(req, res) {

        try {

            const {
                produto_id,
                cnpj_emissor,
                valor, 
                quantidade, 
                valorInformado, //booleano true ou false
                data_compra,
                numero_nf,
                serie_nota,
                chave_acesso,
                tipo,
                urlCloudinary
            } = req.body;

            const resultado = calcularValorTotal(valor, quantidade, valorInformado);

            const documentoFiscal = await Documento_Fiscal.create({
                produto_id,
                cnpj_emissor,
                valor_unitario: resultado.valor_unitario,
                valor: resultado.valor_total,
                quantidade: resultado.quantidade,
                data_compra,
                numero_nf,
                serie_nota,
                chave_acesso,
                tipo,
                urlCloudinary
            });

            return res.status(201).json(documentoFiscal);

        } catch (error) {

            return res.status(500).json({
                erro: error.message
            });

        }
    }

    async update(req, res) {
        try {
            const { produto_id } = req.params;
            const {
                cnpj_emissor,
                valor,
                quantidade,
                valorInformado,
                data_compra,
                numero_nf,
                serie_nota,
                chave_acesso,
                tipo,
                urlCloudinary
            } = req.body;

            const documento = await Documento_Fiscal.findOne({
                where: { produto_id: Number(produto_id) }
            });

            if (!documento) {
                return res.status(404).json({ erro: 'Documento fiscal não encontrado' });
            }

            const resultado = calcularValorTotal(valor, quantidade, valorInformado);

            await documento.update({
                cnpj_emissor,
                valor_unitario: resultado.valor_unitario,
                valor: resultado.valor_total,
                quantidade: resultado.quantidade,
                data_compra,
                numero_nf,
                serie_nota,
                chave_acesso,
                tipo,
                urlCloudinary
            });

            return res.json(documento);

        } catch (error) {
            return res.status(500).json({
                erro: error.message
            });
        }
    }
}

module.exports = new DocumentoFiscalController();