//calculo da quantidade de produtos

function calcularValorTotal (valor, quantidade){
	const qtd = Number(quantidade); 

if (qtd <= 0) {
	return 0;
}

	return valor * qtd;
}


module.exports = calcularValorTotal;