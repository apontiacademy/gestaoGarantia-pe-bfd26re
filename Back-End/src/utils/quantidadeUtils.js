//calculo do preço de produtos pela quantidade

function calcularValorTotal (valor, quantidade, valorInformado){
	const qtd = Number(quantidade);
	const valorNum = Number(valor); 
	let alerta = false;
	let valor_unitario;	
	let valor_total;

if (qtd <= 0){
	throw new Error('Quantidade inválida');
}

if (valorInformado) {
	valor_unitario = valorNum;
	valor_total = valorNum * qtd;
    alerta = true
} else {
	valor_unitario = valorNum / qtd;
	valor_total = valorNum;
	alerta = false
}
	return{alerta, quantidade: qtd, valor_unitario, valor_total};
}

module.exports = calcularValorTotal;