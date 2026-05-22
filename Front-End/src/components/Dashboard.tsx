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
    countClass: "",
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(({ key, label, countClass, icon: Icon, iconColor }) => {
        const selected = statusFilter === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onStatusChange(key)}
            className={`bg-white shadow rounded-lg p-4 flex justify-between items-center text-left transition ring-offset-2 hover:shadow-md ${
              selected ? "ring-2 ring-primary-start" : ""
            }`}
          >
            <div className="flex flex-col px-3 text-center">
              <span>{label}</span>
              <span className={`text-xl font-bold ${countClass}`}>
                {counts[key]}
              </span>
            </div>
            <Icon color={iconColor} />
          </button>
        );
      })}
    </div>
  );
}
