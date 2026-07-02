export type NotificationType =
  | "created"
  | "updated"
  | "trashed"
  | "restored"
  | "deleted_permanent";

export const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  created: "Garantia criada",
  updated: "Garantia atualizada",
  trashed: "Movida para a lixeira",
  restored: "Garantia restaurada",
  deleted_permanent: "Garantia excluída",
};

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  warrantyId?: string;
}
