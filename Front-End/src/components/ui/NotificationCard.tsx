interface NotificationCardProps {
    title: string;
    description: string;
    time: string;
    isNew?: boolean;
    icon?: string;
}

export default function NotificationCard({
    title,
    description,
    time,
    isNew,
}: NotificationCardProps) {
    return (
        <div
            className="
                relative flex flex-col gap-1.5
                px-4 py-3.5
                border-b border-gray last:border-none
                transition-colors duration-150
                hover:bg-primary/5
                cursor-pointer
                "
        >
            {/* BARRA LATERAL - só quando isNew */}
            {isNew && (
                <span className="absolute left-0 top-0 h-full w-[5px] rounded-r-xl bg-primary" />
            )}

            <div className="flex items-start gap-3">
                {/* TEXTO */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <h4
                            className={`
                                text-base leading-snug truncate
                                ${isNew
                                    ? "font-semibold"
                                    : "font-medium"}
                `}
                        >
                            {title}
                        </h4>
                        {isNew && (
                            <span className="w-[8px] h-[8px] rounded-full bg-primary shrink-0" />
                        )}
                    </div>

                    <p className="text-sm text-gray-dark leading-relaxed line-clamp-2">
                        {description}
                    </p>

                    <span className="text-xs text-gray-dark mt-0.5">
                        {time}
                    </span>
                </div>
            </div>
        </div>
    );
}