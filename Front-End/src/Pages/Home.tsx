import { Plus, Search, Package, SearchX,FileText } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";
import Dashboard from "../components/Dashboard";
import Button from "../components/ui/Button";
import WarrantyCard from "../components/ui/WarrantyCard";
import EmptyState from "../components/ui/EmptyState";
import { useNavigate } from "react-router-dom";
import { useWarranty } from "../contexts/WarrantyContext";
import { useMemo, useState, useEffect } from "react";
import {
  applyStatusFilter,
  countWarrantiesByStatus,
  type StatusFilterOption,
} from "../utils/filterWarranties";

export default function Home() {
  const navigate = useNavigate();
  const { activeWarranties, loadWarrantiesFromApi, isLoadingWarranties } =
    useWarranty();
  const [search, setSearch] = useState("");

  // AJUSTE: Permite carregar as garantias da API tanto para logados quanto para visitantes
  useEffect(() => {
    void loadWarrantiesFromApi();
  }, [loadWarrantiesFromApi]);

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
    <LayoutHome namePage="Minhas Garantias" namePageIcon={FileText}>
          <div className="min-h-screen bg-fundo py-2">
            <div className="w-full max-w-8xl mx-auto  sm:px-5 ">
              {/* Container Branco - Mesmo estilo do Login */}
              <div className="flex flex-col gap-8">
                
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                      Minhas Garantias
                    </h1>
                    <p className="text-gray-dark mt-1 text-base">
                      Gerencie prazos, documentos e status em um só lugar.
                    </p>
                  </div>

              <Button
                variant="primary"
                onClick={() => navigate("/create-warranty")}
                className="shrink-0 flex items-center gap-2 h-12 px-6 text-base shadow-md hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Nova Garantia
              </Button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative max-w-xxl">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="search"
                placeholder="Pesquisar garantias por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-grey-500 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base transition-all"
              />
            </div>

            {/* Dashboard de Status */}
            <Dashboard
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              counts={counts}
            />

            {/* Lista de Garantias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoadingWarranties && activeWarranties.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-dark">
                  Carregando suas garantias...
                </div>
              ) : filteredWarranties.length === 0 ? (
                activeWarranties.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Package}
                      title="Nenhuma garantia ainda"
                      description="Cadastre sua primeira garantia para começar a organizar tudo."
                    />
                  </div>
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={SearchX}
                      title="Nenhum resultado encontrado"
                      description="Tente alterar os filtros ou o termo de busca."
                    />
                  </div>
                )
              ) : (
                filteredWarranties.map((warranty) => (
                  <WarrantyCard
                    key={warranty.id}
                    variant="home"
                    title={warranty.productName ?? warranty.title}
                    story={warranty.story}
                    nfNumber={warranty.nfNumber}
                    purchaseDate={warranty.purchaseDate}
                    expirationDate={warranty.expirationDate}
                    warrantyType={warranty.warrantyType}
                    value={warranty.value}
                    status={warranty.status}
                    daysToExpire={warranty.daysToExpire}
                    onViewMore={() => navigate(`/garantia/${warranty.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutHome>
  );
}