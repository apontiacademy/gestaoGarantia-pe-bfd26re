import { useCallback, useRef, useState, type ReactNode } from "react";
import Toast from "../components/ui/Toast";
import {
  ToastContext,
  type ToastState,
  type ToastVariant,
} from "./toast-context";

export function ToastProvider({
  children,
  durationMs = 2500,
}: {
  children: ReactNode;
  durationMs?: number;
}) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    variant: "default",
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast({ visible: true, message, variant });
      timeoutRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, durationMs);
    },
    [durationMs]
  );

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      <Toast
        message={toast.message}
        visible={toast.visible}
        variant={toast.variant}
      />
    </ToastContext.Provider>
  );
}
