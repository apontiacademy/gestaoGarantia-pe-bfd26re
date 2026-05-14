import { X } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";

export default function ViewWarranty() {
    return (
        <LayoutHome
            namePage="Garantia"
            showMenu={false}
            showNotification={false}
            showBack
        >
            <div className="max-w-7xl mx-auto p-4 space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-xl font-bold">
                            Geladeira Electrolux
                        </h1>
                        <p className="text-sm text-gray-dark">
                            Nº da nota: <span className="font-medium">12356</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <p className="text-sm font-medium text-red-500">
                            Garantia vencida
                        </p>
                    </div>
                </div>

                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ESQUERDA - DADOS */}
                    <div className="space-y-3">
                        <h2 className="font-semibold text-lg">Detalhes</h2>

                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Data da compra:</span> 11/05/2026</p>
                            <p><span className="font-medium">Vencimento:</span> 12/05/2026</p>
                            <p><span className="font-medium">Loja:</span> Magazine Luiza</p>
                            <p><span className="font-medium">Garantia estendida:</span> Não</p>
                            <p className="break-all">
                                <span className="font-medium">Chave:</span> 15484521654846546748...
                            </p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-500">Valor</p>
                            <p className="text-2xl font-bold text-green-600">
                                R$ 1.000,00
                            </p>
                        </div>
                    </div>

                    {/* DIREITA - ANEXOS + OBS */}
                    <div className="space-y-4">

                        {/* ANEXOS */}
                        <div className="border rounded-lg p-3">
                            <p className="font-medium mb-2">Arquivos</p>

                            <ul className="flex flex-col divide-y">
                                <li className="flex justify-between py-2">
                                    <span>notafiscal.PDF</span>
                                    <button className="text-gray-500 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </li>

                                <li className="flex justify-between py-2">
                                    <span>notafiscal.PNG</span>
                                    <button className="text-gray-500 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* OBSERVAÇÕES */}
                        <div>
                            <p className="font-medium mb-1">Observações</p>
                            <textarea
                                className="w-full border rounded-lg p-2 text-sm"
                                placeholder="Nenhuma observação adicionada"
                            />
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                        Editar
                    </button>

                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        Excluir
                    </button>
                </div>

            </div>
        </LayoutHome>
    );
}