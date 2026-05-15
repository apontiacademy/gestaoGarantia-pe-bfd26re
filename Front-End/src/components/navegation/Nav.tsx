import { Bell, type LucideIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NotificationCard from "../ui/NotificationCard";

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
    rightLabel
}: NavProps) {

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

    return (
        <nav
            className="
        flex items-center justify-between fixed top-0 w-full z-50
        bg-primary/10 backdrop-blur-md border-b border-gray/25
        px-4 py-3"
        >
            {/* LEFT */}
            <div className="flex items-center gap-5">
                <button
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
                <button
                    aria-label={rightLabel}
                    onClick={() => setIsOpen(!isOpen)}
                    className="
            flex items-center justify-center
            w-12 h-12
            transition
            active:scale-95
            cursor-pointer"
                >
                    <RightIcon size={24} className={isOpen ? "text-primary" : ""} />
                </button>
            ) : (
                <div className="w-12 h-12" /> // mantém alinhamento
            )}
            {isOpen && (
                <div
                    ref={ref}
                    className="
                        absolute right-4 top-16
                        w-75 md:w-120 max-h-[400px]
                        bg-white rounded-xl shadow-2xl border border-gray-dark/50 
                        overflow-hidden z-50
                    "
                >
                    <div className="flex gap-2 p-4 border-b border-gray-dark/50 font-semibold bg-linear-to-l to-primary/10 from-secondary/10">
                        <Bell />
                        Notificações
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {/* LISTA */}
                        <NotificationCard
                            title="Garantia próxima do vencimento"
                            description="Placa mãe expira em 5 dias"
                            time="Agora"
                            isNew
                        />
                        <NotificationCard
                            title="Nova garantia criada"
                            description="Você adicionou um novo item"
                            time="2h atrás"
                        />

                    </div>
                </div>
            )}
        </nav>
    );
}