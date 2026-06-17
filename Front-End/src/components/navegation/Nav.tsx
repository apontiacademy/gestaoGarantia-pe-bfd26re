import { Bell, type LucideIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCard from "../ui/NotificationCard";
import { useNotifications } from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

interface NavProps {
    leftIcon: LucideIcon;
    onLeftClick?: () => void;
    leftLabel?: string;
    namePage?: string;
    namePageIcon?: LucideIcon;

    rightIcon?: LucideIcon;
    onRightClick?: () => void;
    rightLabel?: string;
}

export default function Nav({
    leftIcon: Menu,
    onLeftClick,
    leftLabel,
    namePage,
    namePageIcon: NameIcon,

    rightIcon: RightIcon,
    rightLabel,
    onRightClick,
}: NavProps) {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
    } = useNotifications();

    const showNotifications = RightIcon === Bell;
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!ref.current) return;

            if (!ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleNotifications = () => {
        setIsOpen((prev) => !prev);
        onRightClick?.();
    };

    const handleNotificationClick = (id: string, warrantyId?: string) => {
        markAsRead(id);
        setIsOpen(false);
        if (warrantyId) navigate(`/garantia/${warrantyId}`);
    };

    return (
            <nav
            className="
        flex items-center justify-between fixed top-0 w-full z-50
        bg-fundo border-b border-gray/50
        px-4 py-3"
        >
            {/* LEFT */}
            <div className="flex items-center gap-5">
                <button
                    type="button"
                    aria-label={leftLabel}
                    onClick={onLeftClick}

                    className="
                    flex items-center justify-center
                    w-12 h-12
                    transition
                    active:scale-95
                    cursor-pointer"
                >
                    <Menu size={28} />
                </button>

                {/* NAME PAGE */}
                {namePage && (
                    <div className="flex items-center gap-2">
                        {NameIcon && (
                            <NameIcon size={20} className="text-primary" />
                        )}

                        <span className="text-xl font-semibold text-primary tracking-tight">
                            {namePage}
                        </span>
                    </div>
                )}
            </div>

            {/* RIGHT */}
            {RightIcon ? (
                <div className="relative" ref={showNotifications ? ref : undefined}>
                    <button
                        type="button"
                        aria-label={rightLabel}
                        onClick={
                            showNotifications
                                ? handleToggleNotifications
                                : onRightClick
                        }
                        className="
            relative flex items-center justify-center
            w-12 h-12
            transition
            active:scale-95
            cursor-pointer"
                    >
                        <RightIcon
                            size={24}
                            className={isOpen ? "text-primary" : ""}
                        />
                        {showNotifications && unreadCount > 0 && (
                            <span
                                className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white"
                                aria-label={`${unreadCount} notificações não lidas`}
                            />
                        )}
                    </button>

                    {showNotifications && isOpen && (
                        <div
                            className="
                        absolute right-0 top-14
                        w-75 md:w-120 max-h-[400px]
                        bg-white rounded-2xl shadow-xl border border-gray/50
                        overflow-hidden z-50
                    "
                        >
                            <div className="flex items-center justify-between gap-2 p-4 border-b border-gray/50 font-semibold bg-linear-to-l to-primary/10 from-secondary/10">
                                <div className="flex items-center gap-2 text-gray-dark">
                                    <Bell size={18} />
                                    Notificações
                                </div>
                                {notifications.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAllAsRead();
                                                }}
                                                className="text-xs font-medium text-gray-dark hover:text-primary cursor-pointer"
                                            >
                                                Marcar lidas
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAll();
                                            }}
                                            className="text-xs font-medium text-primary hover:underline cursor-pointer"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="px-4 py-6 text-sm text-gray-dark text-center">
                                        Nenhuma notificação por enquanto.
                                    </p>
                                ) : (
                                    notifications.map((notification) => (
                                        <NotificationCard
                                            key={notification.id}
                                            title={notification.title}
                                            description={notification.description}
                                            time={formatRelativeTime(
                                                notification.createdAt
                                            )}
                                            isNew={!notification.read}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification.id,
                                                    notification.warrantyId
                                                )
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-12 h-12" />
            )}
        </nav>
    );
}
