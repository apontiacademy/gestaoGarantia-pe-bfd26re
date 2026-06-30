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
