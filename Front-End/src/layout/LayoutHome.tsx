import { useState } from "react";
import { Bell, TextAlignStart } from "lucide-react";
import Nav from "../components/navegation/Nav";
import Sidebar from "../components/navegation/Siderbar";

interface LayoutHomeProps {
    children: React.ReactNode;
}

export default function LayoutHome({ children }: LayoutHomeProps) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-fundo">
            <Nav
                // ICONE DE MENU
                leftIcon={TextAlignStart}
                leftLabel="Abrir Menu"
                onLeftClick={() => setIsOpen(true)}
                // ICONE DE NOTIFICAÇÃO
                rightIcon={Bell}     
                onRightClick={() => console.log("Bell")}
            />
            <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

            <main className="max-w-5xl mx-auto px-5 py-6">
                {children}
            </main>
        </div>
    );
}
