// util_garantia_estendida.js

function calcularStatusApolice(dataFim) {
    // Lógica de dias restantes e status
    const hoje = new Date();
    const vencimento = new Date(dataFim);

    const diasRestantes = Math.ceil(
        (vencimento - hoje) / (1000 * 60 * 60 * 24)
    );

    let status = 'Ativa';
    let alerta = false;

    if (diasRestantes < 0) {
        status = 'Vencida';
        alerta = true;
    } else if (diasRestantes <= 30) {
        status = 'Próxima do vencimento';
        alerta = true;
    }

    return {
        dias_restantes: diasRestantes,
        status,
        alerta
    };
}

// Adição útil para o atributo 'valor' da Garantia Estendida
function formatarValorMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

module.exports = {
    calcularStatusApolice,
    formatarValorMoeda
};