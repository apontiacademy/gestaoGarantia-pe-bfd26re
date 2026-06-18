import { FileText, Clock3, CircleCheckBig, CircleX } from "lucide-react";
import {
  countWarrantiesByStatus,
  type StatusFilterOption,
} from "../utils/filterWarranties";

export interface DashboardProps {
  statusFilter: StatusFilterOption;
  onStatusChange: (status: StatusFilterOption) => void;
  counts: ReturnType<typeof countWarrantiesByStatus>;
}

const cards: {
  key: StatusFilterOption;
  label: string;
  countClass: string;
  icon: typeof FileText;
  iconColor?: string;
}[] = [
  {
    key: "all",
    label: "Total",
    countClass: "text-gray-dark",
    icon: FileText,
  },
  {
    key: "expiring",
    label: "A Vencer",
    countClass: "text-yellow",
    icon: Clock3,
    iconColor: "var(--color-yellow)",
  },
  {
    key: "active",
    label: "Ativas",
    countClass: "text-green",
    icon: CircleCheckBig,
    iconColor: "var(--color-green)",
  },
  {
    key: "expired",
    label: "Vencidas",
    countClass: "text-red",
    icon: CircleX,
    iconColor: "var(--color-red)",
  },
];

export default function Dashboard({
  statusFilter,
  onStatusChange,
  counts,
}: DashboardProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {cards.map(({ key, label, countClass, icon: Icon, iconColor }) => {
        const selected = statusFilter === key;
        const count = counts[key];
        return (
          <button
            key={key}
            type="button"
            aria-pressed={selected}
            aria-label={`Filtrar por ${label}: ${count}`}
            onClick={() => onStatusChange(key)}
            className={`flex w-full min-w-0 items-start justify-between gap-2 rounded-lg bg-white p-2.5 shadow transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-start focus-visible:ring-offset-2 sm:gap-3 sm:p-4 ${
              selected ? "ring-2 ring-primary-start ring-offset-2" : ""
            }`}
          >
            <div className="inline-flex min-w-0 flex-col gap-0.5">
              <span className="text-left text-sm font-medium text-gray-dark">
                {label}
              </span>
              <span
                className={`text-center text-xl font-bold leading-none tabular-nums  ${countClass}`}
              >
                {count}
              </span>
            </div>
            <Icon
              aria-hidden
              color={iconColor}
              className="size-5 shrink-0 self-center sm:size-6"
            />
          </button>
        );
      })}
    </div>
  );
}
