import { createContext } from "react";

export type ToastVariant = "default" | "error";

export type ToastState = {
  visible: boolean;
  message: string;
  variant: ToastVariant;
};

export type ToastContextValue = {
  toast: ToastState;
  showToast: (message: string, variant?: ToastVariant) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
