import { useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react"; 
import { useAuth } from "../../contexts/AuthContext"; // Corrigido para ../../

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const { logout } = useAuth(); 

    const handleLogoutClick = () => {
        logout(); // Limpa a sessão (seja funcionário ou visitante)
        onClose(); // Fecha a sidebar
        navigate("/"); // Redireciona para a tela de login externa
    };

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
                <div className="flex flex-col h-[calc(100%-65px)] justify-between p-4">
                    <nav className="space-y-3">
                        <button onClick={() => { navigate("/home"); onClose();}} className="block w-full text-left hover:bg-gray-medium p-2 rounded font-medium">
                            Minhas Garantias
                        </button>

                        <button onClick={() => { navigate("/lixeira"); onClose();}} className="block w-full text-left hover:bg-gray-medium p-2 rounded font-medium">
                            Lixeira
                        </button>

                        <button className="block w-full text-left hover:bg-gray-medium p-2 rounded font-medium">
                            Configurações
                        </button>
                    </nav>

                    {/* BOTÃO DE SAIR NO RODAPÉ */}
                    <button 
                        onClick={handleLogoutClick} 
                        className="flex items-center gap-2 w-full text-left text-red hover:bg-red/10 p-2.5 rounded font-semibold border-t border-gray/20 pt-4"
                    >
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
}