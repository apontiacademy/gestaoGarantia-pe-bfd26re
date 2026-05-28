import { Plus, Search, Package, SearchX } from "lucide-react";
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
      <div className="flex flex-row items-center gap-2 sm:gap-4 mb-5 sm:mb-6 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray/70"
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-0 rounded-lg h-10 sm:h-12 pl-9 pr-3 sm:pr-4 text-sm sm:text-base bg-white focus:outline-none focus:ring-1 focus:ring-gray font-medium shadow border border-gray/50"
          />
        </div>

        <Button
          variant="primary"
          type="button"
          onClick={() => navigate("/create-warranty")}
          className="shrink-0 flex items-center justify-center gap-1 sm:gap-2 h-10 sm:h-12 px-5 py-1.5 sm:py-2 text-xs sm:text-base whitespace-nowrap"
        >
          <Plus size={14} className="hidden sm:block sm:w-5 sm:h-5" />
          <span className="sm:hidden">Nova Garantia</span>
          <span className="hidden sm:inline">Nova Garantia</span>
        </Button>
      </div>


      <div>
        <Dashboard
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          counts={counts}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5 min-w-0">
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
              <div key={id} className="min-w-0">
              <WarrantyCard
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
              </div>
            )
          )
        )}
      </div>
    </LayoutHome>
  );
}