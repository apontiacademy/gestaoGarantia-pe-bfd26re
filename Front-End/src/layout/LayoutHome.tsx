import { useState } from "react";
import { Menu, Bell, ChevronLeft } from "lucide-react";
import { type LucideIcon } from "lucide-react";

import Nav from "../components/navegation/Nav";
import Sidebar from "../components/navegation/Siderbar";

interface LayoutHomeProps {
    children: React.ReactNode;

    namePage?: string;
    namePageIcon?: LucideIcon;

    showMenu?: boolean;
    showBack?: boolean;
    showNotification?: boolean;

    onBack?: () => void;
    onNotification?: () => void;
}

export default function LayoutHome({
    children,
    namePage,
    namePageIcon,

    showMenu = true,
    showBack = false,
    showNotification = true,

    onBack,
    onNotification,
}: LayoutHomeProps) {

    const [isOpen, setIsOpen] = useState(false);

    // Decide qual ícone usar na esquerda
    let leftIcon: LucideIcon = Menu;
    let leftAction = () => setIsOpen(true);
    let leftLabel = "Abrir menu";

    if (showBack) {
        leftIcon = ChevronLeft;
        leftAction = onBack || (() => window.history.back());
        leftLabel = "Voltar";
    }

    // Decide se tem ícone na direita
    const rightIcon = showNotification ? Bell : undefined;

    return (
        <div className="min-h-screen bg-fundo pt-12 md:pt-16">
            <Nav
                leftIcon={leftIcon}
                leftLabel={leftLabel}
                onLeftClick={leftAction}

                namePage={namePage}
                namePageIcon={namePageIcon}

                rightIcon={rightIcon}
                rightLabel="Notificações"
                onRightClick={onNotification}
            />

            {/* Sidebar só se usar menu */}
            {showMenu && !showBack && (
                <Sidebar
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            )}


            <main className="mx-auto px-5 md:px-15 py-8">
                {children}
            </main>
        </div>
    );
}