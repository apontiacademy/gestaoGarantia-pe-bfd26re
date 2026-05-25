import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  NotificationContext,
  type PushNotificationInput,
} from "./notification-context";
import {
  addNotification,
  clearAllNotifications,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "../services/notificationService";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getNotifications()
  );

  const refresh = useCallback(() => {
    setNotifications(getNotifications());
  }, []);

  const pushNotification = useCallback(
    (input: PushNotificationInput) => {
      addNotification(input);
      refresh();
    },
    [refresh]
  );

  const markAsRead = useCallback(
    (id: string) => {
      markNotificationAsRead(id);
      refresh();
    },
    [refresh]
  );

  const markAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
    refresh();
  }, [refresh]);

  const clearAll = useCallback(() => {
    clearAllNotifications();
    refresh();
  }, [refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      pushNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      refresh,
    }),
    [
      notifications,
      unreadCount,
      pushNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      refresh,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
