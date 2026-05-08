import { type Warranty } from "../../services/warrantyService";

export type StatusFilterOption = "all" | "active" | "expiring" | "expired";

interface StatusFilterProps {
    value: StatusFilterOption;
    onChange: (status: StatusFilterOption) => void;
    warranties: Warranty[];
}

function countByStatus(warranties: Warranty[]): Record<StatusFilterOption, number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soonThreshold = 30;

    let active = 0, expiring = 0, expired = 0;

    for (const w of warranties) {
        if (!w.expirationDate) {
            active++;
            continue;
        }
        const exp = new Date(w.expirationDate);
        exp.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) expired++;
        else if (diffDays <= soonThreshold) expiring++;
        else active++;
    }

    return { all: warranties.length, active, expiring, expired };
}

const OPTIONS: { key: StatusFilterOption; label: string; color: string; activeClass: string }[] = [
    {
        key: "all",
        label: "Todas",
        color: "text-gray-medium",
        activeClass: "bg-gray-dark text-white shadow",
    },
    {
        key: "active",
        label: "Ativas",
        color: "text-green",
        activeClass: "bg-green text-white shadow",
    },
    {
        key: "expiring",
        label: "A Vencer",
        color: "text-yellow",
        activeClass: "bg-yellow text-white shadow",
    },
    {
        key: "expired",
        label: "Vencidas",
        color: "text-red",
        activeClass: "bg-red text-white shadow",
    },
];

export default function StatusFilter({ value, onChange, warranties }: StatusFilterProps) {
    const counts = countByStatus(warranties);

    return (
        <div className="flex gap-2 flex-wrap">
            {OPTIONS.map((opt) => {
                const isActive = value === opt.key;
                return (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => onChange(opt.key)}
                        className={`
                            flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-1.5 rounded-lg text-xs sm:text-base font-medium
                            transition-all duration-150 cursor-pointer
                            ${isActive ? opt.activeClass : `bg-white ${opt.color} hover:bg-gray/40 shadow`}
                        `}
                    >
                        {opt.label}
                        <span className={`
                            text-xs sm:text-sm font-semibold px-1.5 py-0.5 rounded-full
                            ${isActive ? "bg-white/25 text-inherit" : "bg-gray/50 text-gray-dark/70"}
                        `}>
                            {counts[opt.key]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}