import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import simboloAponti from "../Assets/logos/simboloAponti.svg"
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const successMessage = location.state?.message as string | undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.senha) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authService.login(form);
      login(token, user);
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DO BOTÃO DE VISITANTE COM PREVENT DEFAULT
  const handleGuestClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Impede o formulário de tentar fazer login ou recarregar a página
    
    // Navega para a rota pública que aceita o parâmetro dinâmico :id enviado no App.tsx
    navigate("/garantia/visitante"); 
  };

  return (
    <div className="min-h-screen flex bg-fundo">

      {/* LADO ESQUERDO ROXO */}

      {/* LADO ESQUERDO BRANC */}
      <div className="w-full flex items-center justify-center px-2 bg-fundo">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-10 py-12 flex flex-col gap-5">

          <div className="flex flex-col items-center gap-2 mb-2">
            <img src={simboloAponti} alt="Símbolo Aponti" className="w-16" />

            <h1 className="text-xl font-bold">Bem-vindo(a) de volta!</h1>
            <p className="text-sm text-gray-dark text-center">
              Faça login e comece a organizar suas garantias
            </p>
          </div>

          {/* MENSAGEM DE SUCESSO */}
          {successMessage && (
            <p className="text-xs text-green text-center bg-green/10 rounded-lg px-3 py-2">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Seu email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="bg-white border border-gray/50"
            />

            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              name="senha"
              placeholder="Sua senha"
              value={form.senha}
              onChange={handleChange}
              autoComplete="current-password"
              className="bg-white border border-gray/50"
              rightIcon={showPassword ? <EyeOff size={18} className="cursor-pointer" /> : <Eye size={18} className="cursor-pointer" />}
              onRightIconClick={() => setShowPassword((v) => !v)}
            />

            {error && <p className="text-xs text-red text-center -mt-1">{error}</p>}

            {/* SEÇÃO DE BOTÕES */}
            <div className="flex flex-col gap-3 justify-center">
              <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? "Entrando..." : "Login"}
              </Button>

              {/* BOTÃO DE VISITANTE INDEPENDENTE DO FORMULÁRIO */}
              <button 
                type="button" 
                onClick={handleGuestClick} 
                className="w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 font-medium text-sm transition-colors text-center cursor-pointer"
              >
                Acessar como Visitante
              </button>
            </div>
          </form>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline hover:text-gray-dark cursor-pointer font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="button"
            className="text-sm text-gray-dark hover:underline text-center font-medium cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Não tem uma conta? <span className="text-primary hover:text-gray-dark/70">Criar Conta</span>
          </button>

        </div>

      </div>
    </div>
  );
}