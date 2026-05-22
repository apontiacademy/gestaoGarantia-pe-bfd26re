function calcularStatusGarantia(dataFim){
    const hoje = new Date();

    const vencimento = new Date(dataFim);

    const diasRestantes = Math.ceil(
        (vencimento - hoje) / (1000 * 60 * 60 * 24)
    );

    let status = 'Ativa';
    let alerta = false

    if(diasRestantes < 0){
        status = 'Vencida';
        alerta = true
    }else if (diasRestantes <= 30){
        status = 'Próxima do vencimento';
        alerta = true
    }

    return {
        dias_restantes: diasRestantes,
        status,
        alerta
    };
}

module.exports = {
    calcularStatusGarantia
};