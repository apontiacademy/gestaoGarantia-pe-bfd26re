import { useState } from "react";
import { Bell, TextAlignStart } from "lucide-react";   // ← Importando os ícones

import Nav from "../components/navegation/Nav";
import Sidebar from "../components/navegation/Siderbar"; // Corrija o nome se necessário (Sidebar)

interface LayoutHomeProps {
    children: React.ReactNode;
}

export default function LayoutHome({ children }: LayoutHomeProps) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-fundo">
            <Nav
                leftIcon={TextAlignStart}
                leftLabel="Abrir Menu"
                onLeftClick={() => setIsOpen(true)}
                
                rightIcon={Bell}
                rightLabel="Notificações"
                onRightClick={() => console.log("Abrir notificações")}
            />

            <Sidebar 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
            />

            <main className="max-w-5xl mx-auto px-5 py-6">
                {children}
            </main>
        </div>
    );
}