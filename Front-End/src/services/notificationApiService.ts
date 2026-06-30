import { api } from "./api";
import type {
  AppNotification,
  NotificationType,
} from "./notificationService";

export interface ApiNotification {
  id: number;
  id_usuario: number;
  garantia_id: number | null;
  tipo: string;
  mensagem: string;
  lida: boolean;
  data_envio: string | null;
  createdAt: string;
  updatedAt: string;
}

const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  created: "Nova garantia criada",
  updated: "Garantia atualizada",
  trashed: "Enviada para a lixeira",
  restored: "Garantia restaurada",
  deleted_permanent: "Excluída permanentemente",
};

const NOTIFICATION_TYPES: NotificationType[] = [
  "created",
  "updated",
  "trashed",
  "restored",
  "deleted_permanent",
];

function isApiNotification(value: unknown): value is ApiNotification {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.tipo === "string" &&
    typeof o.mensagem === "string" &&
    typeof o.lida === "boolean"
  );
}

function normalizeNotificationType(tipo: string): NotificationType {
  if (NOTIFICATION_TYPES.includes(tipo as NotificationType)) {
    return tipo as NotificationType;
  }
  return "updated";
}

export function mapApiNotificationToApp(
  notification: ApiNotification
): AppNotification {
  const type = normalizeNotificationType(notification.tipo);

  return {
    id: String(notification.id),
    type,
    title: NOTIFICATION_TITLES[type],
    description: notification.mensagem,
    createdAt:
      notification.data_envio ??
      notification.createdAt ??
      new Date().toISOString(),
    read: notification.lida,
    warrantyId:
      notification.garantia_id != null
        ? String(notification.garantia_id)
        : undefined,
  };
}

export async function fetchNotificationsFromApi(): Promise<AppNotification[]> {
  const response = await api.get<unknown>("/notificacoes");
  if (!Array.isArray(response)) return [];

  return response
    .filter(isApiNotification)
    .map(mapApiNotificationToApp)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function markNotificationAsReadViaApi(
  id: string
): Promise<void> {
  await api.patch(`/notificacoes/${id}/read`, {});
}

export async function markAllNotificationsAsReadViaApi(): Promise<void> {
  await api.patch("/notificacoes/read-all", {});
}

export async function clearAllNotificationsViaApi(): Promise<void> {
  await api.delete("/notificacoes/all");
}
