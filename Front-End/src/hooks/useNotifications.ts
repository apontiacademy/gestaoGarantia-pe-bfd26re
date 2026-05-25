import { useContext } from "react";
import { NotificationContext } from "../contexts/notification-context";

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications precisa estar dentro de NotificationProvider"
    );
  }
  return ctx;
}
