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

  const handleSubmit = async () => {
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

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Seu email"
            value={form.email}
            onChange={handleChange}
            className="bg-white border border-gray/50"
          />

          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            name="senha"
            placeholder="Sua senha"
            value={form.senha}
            onChange={handleChange}
            className="bg-white border border-gray/50"
            rightIcon={showPassword ? <EyeOff size={18} className="cursor-pointer" /> : <Eye size={18} className="cursor-pointer" />}
            onRightIconClick={() => setShowPassword((v) => !v)}
          />

          {error && <p className="text-xs text-red text-center -mt-1">{error}</p>}

          <div className="flex justify-center">
            <Button variant="primary" onClick={handleSubmit} disabled={loading} className="w-full">

              {loading ? "Entrando..." : "Login"}
            </Button>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline hover:text-gray-dark cursor-pointer font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            className="text-sm text-gray-dark hover:underline text-center font-medium cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Não tem uma conta? <span className="text-primary hover:text-gray-dark/70">Criar Conta</span>
          </button>

          <Button variant="primary" onClick={() => navigate("/home-demo")}>
            Entrar como visitante
          </Button>
        </div>


      </div>
    </div>
  );
}