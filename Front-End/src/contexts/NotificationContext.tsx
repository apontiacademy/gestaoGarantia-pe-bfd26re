import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NotificationContext } from "./notification-context";
import type { AppNotification } from "../services/notificationService";
import {
  clearAllNotificationsViaApi,
  fetchNotificationsFromApi,
  markAllNotificationsAsReadViaApi,
  markNotificationAsReadViaApi,
} from "../services/notificationApiService";
import { GARANTIAS_SESSION_EVENT } from "./AuthContext";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotificationsFromApi = useCallback(async () => {
    const token = localStorage.getItem("@garantias:token");
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      const fromApi = await fetchNotificationsFromApi();
      setNotifications(fromApi);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    void loadNotificationsFromApi();

    const onSessionUpdated = () => {
      void loadNotificationsFromApi();
    };

    window.addEventListener(GARANTIAS_SESSION_EVENT, onSessionUpdated);
    return () => {
      window.removeEventListener(GARANTIAS_SESSION_EVENT, onSessionUpdated);
    };
  }, [loadNotificationsFromApi]);

  const refresh = useCallback(() => {
    void loadNotificationsFromApi();
  }, [loadNotificationsFromApi]);

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      void markNotificationAsReadViaApi(id).catch(() => {
        void loadNotificationsFromApi();
      });
    },
    [loadNotificationsFromApi]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => (n.read ? n : { ...n, read: true }))
    );

    void markAllNotificationsAsReadViaApi().catch(() => {
      void loadNotificationsFromApi();
    });
  }, [loadNotificationsFromApi]);

  const clearAll = useCallback(() => {
    setNotifications([]);

    void clearAllNotificationsViaApi().catch(() => {
      void loadNotificationsFromApi();
    });
  }, [loadNotificationsFromApi]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearAll,
      refresh,
    }),
    [
      notifications,
      unreadCount,
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
