import { type LucideIcon } from "lucide-react";

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
    onRightClick,
    rightLabel
}: NavProps) {
    return (
        <nav
            className="
        flex items-center justify-between
        bg-white backdrop-blur-md
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
                    <Menu size={28}/>
                </button>

                {/* NAME PAGE */}
                {namePage && (
                    <div className="w-px h-6 bg-gray-200" />
                )}

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
                    onClick={onRightClick}
                    className="
            flex items-center justify-center
            w-12 h-12
            transition
            active:scale-95
            cursor-pointer"
                >
                    <RightIcon size={24} />
                </button>
            ) : (
                <div className="w-12 h-12" /> // mantém alinhamento
            )}
        </nav>
    );
}


/*
QUANDO USAR BOTÃO DE VOLTAR:
<Nav 
    leftIcon={ChevronLeft}
    leftLabel="Voltar"
    onLeftClick={() => window.history.back()
    />


    QUANDO FOR USAR O MENU:
    import Sidebar from "./components/navegation/Siderbar"

    const [isOpen, setIsOpen] = useState(false);

    <Nav 
        leftIcon={Menu}
        leftLabel="Abrir Menu"
        onLeftClick={() => setIsOpen(true)}
        />
        
        <Sidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        />
*/