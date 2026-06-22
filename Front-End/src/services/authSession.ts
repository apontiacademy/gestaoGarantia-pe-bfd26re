import { clearStoredAuth } from "../utils/authToken";

/** Disparado quando a sessão expira (token JWT vencido). */
export const GARANTIAS_SESSION_EXPIRED_EVENT = "garantias:session-expired";

export function emitSessionExpired(): void {
  clearStoredAuth();
  window.dispatchEvent(new Event(GARANTIAS_SESSION_EXPIRED_EVENT));
}
