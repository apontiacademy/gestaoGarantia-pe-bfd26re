import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { useWarranty } from "../../contexts/WarrantyContext";
import { formatDaysToExpireLabel } from "../../utils/warrantyDisplay";
import { getExpiringWarranties } from "../../utils/expiringWarranties";

const DISMISSED_ALERTS_KEY = "@garantias:dismissed-expiration-alerts";

const HIDDEN_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

function loadDismissedIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>): void {
  sessionStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify([...ids]));
}

export default function WarrantyExpirationAlerts() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeWarranties } = useWarranty();
  const [dismissedIds, setDismissedIds] = useState(loadDismissedIds);

  const expiringWarranties = useMemo(() => {
    return getExpiringWarranties(activeWarranties).filter(
      (warranty) => !dismissedIds.has(warranty.id)
    );
  }, [activeWarranties, dismissedIds]);

  const shouldHide = HIDDEN_ROUTES.has(pathname);

  if (shouldHide || expiringWarranties.length === 0) {
    return null;
  }

  const dismissAlert = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissedIds(next);
      return next;
    });
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-999 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 pointer-events-none"
    >
      {expiringWarranties.map((warranty) => {
        const daysLabel = formatDaysToExpireLabel(
          warranty.daysToExpire,
          "A vencer"
        );

        return (
          <div
            key={warranty.id}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-yellow/30 bg-yellow-light px-4 py-3 shadow-lg"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow/15 text-yellow">
              <AlertTriangle size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-dark truncate">
                {warranty.title}
              </p>
              <p className="mt-0.5 text-sm text-gray-secondary">
                {daysLabel ?? "Garantia a vencer"}
              </p>
              <button
                type="button"
                onClick={() => navigate(`/garantia/${warranty.id}`)}
                className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Ver garantia
              </button>
            </div>

            <button
              type="button"
              aria-label="Fechar alerta"
              onClick={() => dismissAlert(warranty.id)}
              className="shrink-0 rounded-lg p-1 text-gray-medium transition-colors hover:bg-yellow/20 hover:text-gray-dark cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
