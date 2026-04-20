import { type LucideIcon } from "lucide-react";

interface NavProps {
    leftIcon: LucideIcon;
    onLeftClick?: () => void;
    leftLabel?: string;

    rightIcon?: LucideIcon;
    onRightClick?: () => void;
    rightLabel?: string;
}

export default function Nav({
    leftIcon: LeftIcon,
    onLeftClick,
    leftLabel,

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
                <LeftIcon size={28} />
            </button>

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