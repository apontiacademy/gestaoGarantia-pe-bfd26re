import { createContext } from "react";
import type { AppNotification } from "../services/notificationService";

export type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refresh: () => void;
};

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);
