// src/pages/Home.tsx
import { Plus, CopyPlus, SlidersHorizontal, Search } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";
import Dashboard from "../components/Dashboard";
import Button from "../components/ui/Button";
import FloatingButton from "../components/ui/FloatingButton";
import WarrantyCard from "../components/ui/WarrantyCard"
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <LayoutHome>
            <div className="fixed bottom-8 right-6 flex flex-col gap-4">
                <FloatingButton icon={Plus} onClick={() => { navigate("/warranty-register")}}/>
                <FloatingButton icon={CopyPlus} />
            </div>

            {/* CAMPO DE PESQUISA E FILTRO */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full rounded-lg h-9 pl-9 pr-4 bg-white focus:outline-none focus:ring-1 focus:ring-gray font-medium shadow"
                    />
                </div>
                <button className="p-2 bg-white rounded-lg hover:bg-gray transition shadow">
                    <SlidersHorizontal size={18} />
                </button>
            </div>

            {/* BOTÕES DE CRIAR */}
            <div className="flex gap-3 mb-8 text-sm">
                <Button variant="secondary" type="button" onClick={() => { navigate("/warranty-register")}} className="flex items-center gap-2 w-50">
                    <Plus size={22} /> Nova Garantia
                </Button>
                <Button variant="secondary" type="button" className="flex items-center gap-2 w-50">
                    <CopyPlus size={25} /> Novo Grupo de Garantia
                </Button>
            </div>

            {/* DASHBOARD */}
            <div>
                <Dashboard />
            </div>


            {/* GARANTIAS/GRUPOS DE GARANTIAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 m-2 p-6 rounded-lg bg-white">
                {/*<p>Nenhuma Garantia Cadastrada</p>*/}
                <WarrantyCard
                    title="Notbook Samsung"
                    type="individual"
                    status="ativa"
                    details={[
                        {label: "Fornecedor", value: "Samsung"},
                        { label: "Vencimento", value: "01/01/2026" },
                        { label: "Valor", value: "R$ 1.500,00" },
                    ]}
                    onViewMore={() => console.log("Ver mais")}
                />
                <WarrantyCard
                    title="Garantias do FAP 2026"
                    type="group"
                    status="A Vencer"
                    details={[
                        {label: "Qtd. Itens", value: "5"},
                        { label: "Vencimento", value: "15/03/2026" },
                    ]}
                    onViewMore={() => console.log("Ver mais")}
                />
            </div>

        </LayoutHome>
    );
}