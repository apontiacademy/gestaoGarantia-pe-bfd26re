// BOTÃO USADO QUE CONTENHAM APENAS O NOME (LOGIN, CADASTRO, SALVAR...)
import "../../styles/global.css"

//PROPRIEDADES DO BOTÃO
type ButtonProps = {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "ghost";
    className?: string;
};

export default function Button({
    children,
    onClick,
    type = "button", // VALOR INICIAL ATRIBUIDO BUTTON (PODE MUDAR PARA SUBMIT OU RESET, SE NECESSÁRIO)
    variant = "primary", // VALOR INICIAL ATRIBUIDO COMO PRIMEIRA VARIANTE (COM DEGARDE DE FUNDO)
    className = ""
}: ButtonProps) {

    // ATRIBUIR CORES, QUE VAI DEFINIR A VARIAÇÃO
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white", // VARIAÇÃO PARA TELAS ANTES DO LOGIN (COM DEGRADE)
    ghost: "bg-white text-black border", //VARIAÇÃO GHOST (SEM COR DE FUNDO)
    secondary: "bg-gray text-black " //VARIAÇÃO COM FUNDO CINZA
};

return (
    <button
        type={type}
        onClick={onClick}
        className={`
        ${variants[variant]}
        hover:brightness-110 hover:shadow-l
        active:scale-95 active:brightness-90
        transition-all duration-200
        font-medium 
        cursor-pointer
        px-7 py-2 rounded-lg
        ${className}
        `}
        >
            {children} {/* CONTEÚDO DO BOTÃO */}
        </button>
    )
}