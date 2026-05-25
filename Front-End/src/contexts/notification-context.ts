import { createContext } from "react";
import type { AppNotification } from "../services/notificationService";

export type PushNotificationInput = Omit<
  AppNotification,
  "id" | "createdAt" | "read"
> & { read?: boolean };

export type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  pushNotification: (input: PushNotificationInput) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refresh: () => void;
};

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);
