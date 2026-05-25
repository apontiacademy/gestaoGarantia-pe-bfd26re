export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 60_000) return "Agora";

  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) {
    return diffMin === 1 ? "1 min atrás" : `${diffMin} min atrás`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1h atrás" : `${diffHours}h atrás`;
  }

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfYesterday && date < startOfToday) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}
