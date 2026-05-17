import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Estado vazio reutilizável: centralizado, com ícone Lucide.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`col-span-full flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 md:py-24 min-h-[min(50vh,22rem)] ${className}`}
    >
      <div
        className="
          mb-5 flex h-16 w-16 items-center justify-center rounded-2xl
          bg-white shadow-sm ring-1 ring-gray-dark/10
          transition-all duration-200 ease-out
          motion-reduce:transition-none motion-reduce:hover:scale-100
        "
      >
        <Icon
          className="text-gray-dark/55 transition-opacity duration-200 hover:opacity-90"
          strokeWidth={1.5}
          size={32}
          aria-hidden
        />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-gray-dark sm:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-dark/70 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
