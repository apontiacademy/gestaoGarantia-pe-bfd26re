import { type Warranty } from "../services/warrantyService";
import { type StatusFilterOption } from "../components/ui/StatusFilter";

export function applyStatusFilter(warranties: Warranty[], filter: StatusFilterOption): Warranty[] {
    if (filter === "all") return warranties;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soonThreshold = 30;

    return warranties.filter((w) => {
        if (!w.expirationDate) return filter === "active";
        const exp = new Date(w.expirationDate);
        exp.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (filter === "expired") return diffDays < 0;
        if (filter === "expiring") return diffDays >= 0 && diffDays <= soonThreshold;
        if (filter === "active") return diffDays > soonThreshold;
        return true;
    });
}