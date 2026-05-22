import { Plus, CopyPlus, Search, Package, SearchX } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";
import Dashboard from "../components/Dashboard";
import Button from "../components/ui/Button";
import WarrantyCard from "../components/ui/WarrantyCard";
import EmptyState from "../components/ui/EmptyState";
import { useNavigate } from "react-router-dom";
import { useWarranty } from "../contexts/WarrantyContext";
import { useMemo, useState } from "react";
import {
  applyStatusFilter,
  countWarrantiesByStatus,
  type StatusFilterOption,
} from "../utils/filterWarranties";

export default function Home() {
  const navigate = useNavigate();
  const { activeWarranties } = useWarranty();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption>("all");

  const counts = useMemo(
    () => countWarrantiesByStatus(activeWarranties),
    [activeWarranties]
  );

  const filteredWarranties = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bySearch = q
      ? activeWarranties.filter((w) => w.title.toLowerCase().includes(q))
      : activeWarranties;
    return applyStatusFilter(bySearch, statusFilter);
  }, [activeWarranties, search, statusFilter]);

  return (
    <LayoutHome namePage="">
      <div className="flex flex-col gap-4 mb-6">
        <div className="hidden md:flex items-center gap-4">
          {/* CAMPO DE PESQUISA */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg h-12 pl-9 pr-4 bg-white focus:outline-none focus:ring-1 focus:ring-gray font-medium shadow border border-gray/50"
            />
          </div>

          {/* BOTÃO DE CRIAR */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                navigate("/create-warranty");
              }}
              className="flex items-center gap-2 py-2.5"
            >
              <Plus size={22} /> Nova Garantia
            </Button>
          </div>
        </div>
      </div>

      {/* PARA MOBILE */}
      <div className="md:hidden flex flex-col gap-3 mb-5">

        {/* SEARCH */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg h-9 pl-9 pr-4 bg-white focus:outline-none focus:ring-1 focus:ring-gray font-medium shadow border border-gray/50"
          />
        </div>

        {/* BOTÕES NO MOBILE */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => navigate("/create-warranty")}
            className="flex-1 flex items-center justify-center gap-2 py-2"
          >
            <Plus size={18} /> Nova Garantia
          </Button>

          <Button
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2 py-2"
          >
            <CopyPlus size={18} /> Novo Grupo
          </Button>
        </div>
      </div>


      <div>
        <Dashboard
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          counts={counts}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5">
        {filteredWarranties.length === 0 ? (
          activeWarranties.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhuma garantia ainda"
              description="Cadastre a primeira para acompanhar vencimentos e documentos em um só lugar."
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nada encontrado"
              description="Tente outro termo na busca ou outro filtro nos indicadores acima."
            />
          )
        ) : (
          filteredWarranties.map(
            ({
              id,
              title,
              story,
              nfNumber,
              purchaseDate,
              expirationDate,
              warrantyType,
              value,
            }) => (
              <WarrantyCard
                key={id}
                variant="home"
                title={title}
                story={story}
                nfNumber={nfNumber}
                purchaseDate={purchaseDate}
                expirationDate={expirationDate}
                warrantyType={warrantyType}
                value={value}
                onViewMore={() => {
                  navigate(`/garantia/${id}`);
                }}
              />
            )
          )
        )}
      </div>
    </LayoutHome>
  );
}