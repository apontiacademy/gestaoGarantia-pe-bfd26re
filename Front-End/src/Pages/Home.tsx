import { Plus, CopyPlus, SlidersHorizontal, Search } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";
import Dashboard from "../components/Dashboard";
import Button from "../components/ui/Button";
import FloatingButton from "../components/ui/FloatingButton";
import WarrantyCard from "../components/ui/WarrantyCard"
import { useNavigate } from "react-router-dom";
import { useWarranty } from "../contexts/WarrantyContext";
import { useState } from "react";
import StatusFilter, { type StatusFilterOption } from "../components/ui/StatusFilter";
//import { applyStatusFilter } from "../utils/filterWarranties";

export default function Home() {
    const navigate = useNavigate();
    const { warranties } = useWarranty();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
    const [showFilter, setShowFilter] = useState(false);

    /*const filteredWarranties = applyStatusFilter(
        warranties.filter(({ title }) =>
            title.toLowerCase().includes(search.toLowerCase())
        ),
        statusFilter
    );*/

    return (
        <LayoutHome>
            <div className="fixed bottom-8 right-6 flex flex-col gap-4">
                <FloatingButton icon={Plus} onClick={() => { navigate("/create-warranty") }} />
                <FloatingButton icon={CopyPlus} />
            </div>

            {/* CAMPO DE PESQUISA */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm md:w-full">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg h-9 pl-9 pr-4 bg-white focus:outline-none focus:ring-1 focus:ring-gray font-medium shadow"
                        />
                    </div>
                    <button
                        className={`relative p-2 rounded-lg transition shadow ${showFilter ? "bg-gray-dark text-white" : "bg-white hover:bg-gray"}`}
                        onClick={() => setShowFilter((prev) => !prev)}
                    >
                        <SlidersHorizontal size={18} />

                    </button>
                </div>

                {/* FILTRO */}
                {showFilter && (
                    <StatusFilter
                        value={statusFilter}
                        onChange={setStatusFilter}
                        warranties={warranties}
                    />
                )}
            </div>

            {/* BOTÕES DE CRIAR */}
            <div className="flex gap-5 mb-8 text-sm md:text-base">
                <Button variant="primary" type="button" onClick={() => { navigate("/create-warranty") }} className="flex items-center gap-3 w-50 md:w-55">
                    <Plus size={22} /> Nova Garantia
                </Button>
                <Button variant="primary" type="button" className="flex items-center gap-3 w-50 md:w-55">
                    <CopyPlus size={25} /> Novo Grupo de Garantia
                </Button>
            </div>

            {/* DASHBOARD */}
            <div>
                <Dashboard />
            </div>


            {/* GARANTIAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
                {/*
                {filteredWarranties.length === 0 ? (
                    <p>{search ? "Nenhuma garantia encontada" : "Nenhuma garantia cadastrada"}</p>
                ) : (
                    filteredWarranties.map(({ id, ...card }) => (
                        <WarrantyCard
                            key={id}
                            variant="home"
                            {...card}
                            onViewMore={() => console.log('Ver mais clicado')}
                        />
                    ))
                )}
                */}

                <WarrantyCard
                    title="Geladeira Electrolux"
                    story="Magazine Luiza"
                    nfNumber="12356"

                    purchaseDate="11/05/2026"
                    expirationDate="12/05/2026"
                    warrantyType="Garantia de fábrica"
                    value="3.500,00"

                    variant="home"

                    onViewMore={() => {
                        console.log("Ver mais clicado");
                    }}
                />

                <WarrantyCard
                    title="Macbook Air Apple"
                    story="Apple"
                    nfNumber="5689"

                    purchaseDate="01/01/2026"
                    expirationDate="01/01/2027"
                    warrantyType="Garantia de fábrica"
                    value="6.678,00"

                    variant="home"

                    onViewMore={() => {
                        console.log("Ver mais clicado");
                    }}
                />

                <WarrantyCard
                    title="Macbook Neo Apple"
                    story="Apple"
                    nfNumber="7885"

                    purchaseDate="01/12/2025"
                    expirationDate="01/01/2026"
                    warrantyType="Garantia de fábrica"
                    value="3.339,14"

                    variant="home"

                    onViewMore={() => {
                        console.log("Ver mais clicado");
                    }}
                />
            </div>
        </LayoutHome>
    );
}