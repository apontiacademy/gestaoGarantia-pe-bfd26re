import { Outlet, useLocation } from "react-router-dom";
import { CalendarDays, Bell, FileText } from "lucide-react";
import logoAponti from "../Assets/logos/logobranco.svg";

const features = [
    { icon: <CalendarDays size={22} />, label: "Controle suas garantias" },
    { icon: <Bell size={22} />, label: "Alertas de vencimento" },
    { icon: <FileText size={22} />, label: "Anexe notas fiscais por foto ou PDF" },
];

export default function AuthLayout() {
    const location = useLocation();
    const isRegister = location.pathname.includes("register");

    return (
        <div className="min-h-screen flex bg-fundo overflow-hidden relative">

            {/* PAINEL BRANCO */}
            <div
                className={`
                    absolute top-0 h-full
                    w-full md:w-1/2
                    flex items-center justify-center px-6
                    transition-all duration-700 ease-[cubic-bezier(.77,0,.18,1)]
                    ${isRegister ? "md:left-0" : "md:left-1/2"}
                    left-0
                    `}
            >
                <div
                    key={location.pathname}
                    className={`
                        w-full
                        ${isRegister
                            ? "animate-slide-in-left"
                            : "animate-slide-in-right"}
                    `}
                >
                    <Outlet />
                </div>
            </div>


            {/* PAINEL ROXO DESLIZANDO */}
            <div
                className={`
                    hidden md:flex
                    absolute top-0 h-full w-1/2
                    bg-linear-to-br from-primary to-secondary
                    text-white flex-col justify-center px-16
                    transition-transform duration-700 ease-in-out
                    ${isRegister
                        ? "translate-x-full"
                        : "translate-x-0"}
                    `}
            >
                <div className="absolute -top-16 right-4 w-64 h-64 rounded-full bg-white/10 animate-float-reverse" />
                <div className="absolute -bottom-30 -left-24 w-65 h-65 rounded-full bg-white/10 animate-float" />

                <img
                    src={logoAponti}
                    alt="Logo Aponti"
                    className="w-52 mb-10"
                />

                <h2 className="text-3xl font-bold leading-snug mb-3">
                    O novo gerenciador de garantias da Aponti
                </h2>

                <p className="text-lg mb-10 text-white/90">
                    Mais organização, controle e tranquilidade
                    <br />
                    para você e seus produtos.
                </p>

                <div className="flex flex-col gap-3">
                    {features.map(({ icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-4 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary">
                                {icon}
                            </div>

                            <span>{label}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}