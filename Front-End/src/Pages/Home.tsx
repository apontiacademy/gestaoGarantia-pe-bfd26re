import { Plus, Search, Package, SearchX } from "lucide-react";
import LayoutHome from "../layout/LayoutHome";
import Dashboard from "../components/Dashboard";
import Button from "../components/ui/Button";
import WarrantyCard from "../components/ui/WarrantyCard";
import EmptyState from "../components/ui/EmptyState";
import { useNavigate } from "react-router-dom";
import { useWarranty } from "../contexts/WarrantyContext";
import { useAuth } from "../contexts/AuthContext";
import { useMemo, useState, useEffect } from "react";
import {
  applyStatusFilter,
  countWarrantiesByStatus,
  type StatusFilterOption,
} from "../utils/filterWarranties";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { activeWarranties, loadWarrantiesFromApi, isLoadingWarranties } =
    useWarranty();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      void loadWarrantiesFromApi();
    }
  }, [isAuthenticated, loadWarrantiesFromApi]);

  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");

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
      {/* CONTAINER PRINCIPAL */}
      {/* Borda superior amarela para trazer a cor de acento e sombra com leve tom roxo/escuro */}
      <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-4 border-t-yellow-400 p-6 sm:p-10 flex flex-col gap-8 min-h-[75vh]">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            Minhas Garantias
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Gerencie prazos, documentos e status em um só lugar.
          </p>
        </div>

        {/* BARRA DE PESQUISA E BOTÃO */}
        <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0 w-full">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="relative flex-1 min-w-0 w-full group"
          >
            <label htmlFor="search-warranties" className="sr-only">
              Pesquisar garantias
            </label>
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors"
              aria-hidden
            />
            <input
              id="search-warranties"
              name="search"
              type="search"
              placeholder="Pesquisar garantias por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // Fundo cinza claro que fica branco no focus, com anel de foco roxo
              className="w-full min-w-0 rounded-xl h-12 sm:h-14 pl-12 pr-4 text-sm sm:text-base bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 text-gray-800 border border-gray-200 transition-all duration-200"
            />
          </form>

          <Button
            variant="primary"
            type="button"
            onClick={() => navigate("/create-warranty")}
            // Efeito de hover profissional (elevação e sombra)
            className="shrink-0 flex items-center justify-center gap-2 h-12 sm:h-14 w-full sm:w-auto px-8 py-2 text-sm sm:text-base font-semibold whitespace-nowrap bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Nova Garantia</span>
          </Button>
        </div>

        {/* DASHBOARD INDICADORES */}
        <div className="w-full bg-gray-50/50 rounded-2xl p-1 sm:p-2">
          <Dashboard
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            counts={counts}
          />
        </div>

        {/* LINHA DIVISÓRIA SUTIL (Gradiente) */}
        <div className="h-px w-full bg-linear-to from-transparent via-gray-200 to-transparent"></div>

        {/* GRID DE GARANTIAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-w-0">
          {isLoadingWarranties && activeWarranties.length === 0 ? (
            // SKELETON LOADING (Profissional)
            Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 h-48 flex flex-col gap-4 shadow-sm animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
                  <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
                <div className="mt-auto flex justify-between items-end">
                  <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
                </div>
              </div>
            ))
          ) : filteredWarranties.length === 0 ? (
            // EMPTY STATES
            <div className="col-span-full py-12 flex justify-center">
              {activeWarranties.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Nenhuma garantia ainda"
                  description="Cadastre a primeira para acompanhar vencimentos e documentos em um só lugar."
                  // Opcional: passar classes para estilizar o EmptyState internamente
                />
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="Nada encontrado"
                  description="Tente outro termo na busca ou outro filtro nos indicadores acima."
                />
              )}
            </div>
          ) : (
            // CARDS DE GARANTIA
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
                status,
                daysToExpire,
              }) => (
                <div 
                  key={id} 
                  className="min-w-0 transition-transform duration-200 hover:-translate-y-1"
                >
                  <WarrantyCard
                    variant="home"
                    title={title}
                    story={story}
                    nfNumber={nfNumber}
                    purchaseDate={purchaseDate}
                    expirationDate={expirationDate}
                    warrantyType={warrantyType}
                    value={value}
                    status={status}
                    daysToExpire={daysToExpire}
                    onViewMore={() => navigate(`/garantia/${id}`)}
                  />
                </div>
              )
            )
          )}
        </div>
      </div>
    </LayoutHome>
  );
}