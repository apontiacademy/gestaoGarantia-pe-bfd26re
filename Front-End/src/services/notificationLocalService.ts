import {
  NOTIFICATION_TITLES,
  type AppNotification,
  type NotificationType,
} from "./notificationService";

const LOCAL_NOTIFICATIONS_KEY = "@garantias:notifications:local";

function readStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function writeStoredNotifications(items: AppNotification[]): void {
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(items));
}

export function getLocalNotifications(): AppNotification[] {
  return readStoredNotifications().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function pushLocalNotification(
  type: NotificationType,
  description: string,
  warrantyId?: string
): AppNotification {
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    type,
    title: NOTIFICATION_TITLES[type],
    description,
    createdAt: new Date().toISOString(),
    read: false,
    warrantyId,
  };

  writeStoredNotifications([notification, ...readStoredNotifications()]);
  return notification;
}

export function markLocalNotificationAsRead(id: string): void {
  writeStoredNotifications(
    readStoredNotifications().map((item) =>
      item.id === id ? { ...item, read: true } : item
    )
  );
}

export function clearLocalNotifications(): void {
  localStorage.removeItem(LOCAL_NOTIFICATIONS_KEY);
}
