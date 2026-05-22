import { useCallback, useRef, useState } from "react";

type ToastVariant = "default" | "error";

export function useToast(durationMs = 2500) {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    variant: "default" as ToastVariant,
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

  return { toast, showToast };
}
