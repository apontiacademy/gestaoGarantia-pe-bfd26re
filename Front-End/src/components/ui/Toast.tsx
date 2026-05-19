interface ToastProps {
  message: string;
  visible: boolean;
  variant?: "default" | "error";
}

export default function Toast({
  message,
  visible,
  variant = "default",
}: ToastProps) {
  const bgClass = variant === "error" ? "bg-red" : "bg-primary";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2
        ${bgClass} text-white
        px-5 py-2
        rounded-full
        text-sm font-medium
        transition-opacity duration-300
        whitespace-nowrap
        z-999
        pointer-events-none
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      {message}
    </div>
  );
}
