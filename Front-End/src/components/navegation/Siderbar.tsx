import { useNavigate } from "react-router-dom";
import { X } from "lucide-react"

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    return (
        <>
            {/* OVERLAY (BLUR NO FUNDO) */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="
                    fixed inset-0 bg-black/20
                    backdrop-blur-sm
                    z-40"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-64
                    bg-white shadow-xl
                    z-50
                    transform transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold">Menu</h2>

                    <button
                        onClick={onClose}
                        className="text-sm px-3 py-1 rounded hover:bg-gray-medium"
                    >
                        <X/>
                    </button>
                </div>

                {/* CONTEÚDO */}
                <nav className="p-4 space-y-3">
                    <button onClick={() => { navigate("/home-demo"); onClose();}} className="block w-full text-left hover:bg-gray-medium p-2 rounded">
                        Minhas Garantias
                    </button>

                    <button onClick={() => { navigate("/lixeira"); onClose();}} className="block w-full text-left hover:bg-gray-medium p-2 rounded">
                        Lixeira
                    </button>

                    <button className="block w-full text-left hover:bg-gray-medium p-2 rounded">
                        Configurações
                    </button>
                </nav>
            </aside>
        </>
    );
}