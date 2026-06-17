import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, X } from "lucide-react";

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();

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
                    z-50 flex flex-col
                    transform transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-gray/50">
                    <h2 className="font-semibold text-gray-dark">Menu</h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer text-sm p-2 rounded-lg text-gray-dark hover:bg-gray transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* CONTEÚDO */}
                <nav className="flex flex-1 flex-col p-4">
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => { navigate("/home"); onClose(); }}
                            className="block w-full cursor-pointer text-left text-gray-dark font-medium hover:bg-primary/10 hover:text-primary p-2 rounded-lg transition-colors"
                        >
                            Minhas Garantias
                        </button>

                        <button
                            type="button"
                            onClick={() => { navigate("/lixeira"); onClose(); }}
                            className="block w-full cursor-pointer text-left text-gray-dark font-medium hover:bg-primary/10 hover:text-primary p-2 rounded-lg transition-colors"
                        >
                            Lixeira
                        </button>

                        <button
                            type="button"
                            onClick={() => { navigate('/settings'); onClose(); }}
                            className="block w-full cursor-pointer text-left text-gray-dark font-medium hover:bg-primary/10 hover:text-primary p-2 rounded-lg transition-colors"
                        >
                            Configurações
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => { logout(); onClose(); navigate('/login'); }}
                        className="mt-auto flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left text-red font-medium hover:bg-red/10 transition-colors"
                    >
                        <Trash2 size={18} />
                        Sair
                    </button>
                </nav>
            </aside>
        </>
    );
}