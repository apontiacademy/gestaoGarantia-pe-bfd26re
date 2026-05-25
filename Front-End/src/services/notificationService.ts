export type NotificationType =
  | "created"
  | "updated"
  | "trashed"
  | "restored"
  | "deleted_permanent";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  warrantyId?: string;
}

const STORAGE_KEY = "@garantias:notifications";
const MAX_NOTIFICATIONS = 50;

function isStoredNotification(value: unknown): value is AppNotification {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.type === "string" &&
    typeof o.title === "string" &&
    typeof o.description === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.read === "boolean"
  );
}

function persist(list: AppNotification[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw?.trim()) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isStoredNotification)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch {
    return [];
  }
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function addNotification(
  input: Omit<AppNotification, "id" | "createdAt" | "read"> & {
    read?: boolean;
  }
): AppNotification {
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: input.read ?? false,
    type: input.type,
    title: input.title,
    description: input.description,
    warrantyId: input.warrantyId,
  };

  const prev = getNotifications();
  persist([notification, ...prev].slice(0, MAX_NOTIFICATIONS));
  return notification;
}

export function markNotificationAsRead(id: string): void {
  const list = getNotifications();
  const index = list.findIndex((n) => n.id === id);
  if (index === -1) return;
  list[index] = { ...list[index], read: true };
  persist(list);
}

export function markAllNotificationsAsRead(): void {
  const list = getNotifications().map((n) =>
    n.read ? n : { ...n, read: true }
  );
  persist(list);
}

export function clearAllNotifications(): void {
  persist([]);
}
