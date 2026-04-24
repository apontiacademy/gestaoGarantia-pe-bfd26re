import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import logoAponti from "../Assets/logos/logoAponti.svg";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // limpa erro ao digitar
  };

  const handleSubmit = async () => {
    if (!form.email || !form.senha) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authService.login(form);
      login(token, user); // salva no contexto e localStorage
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fundo px-8">
      <div className="flex flex-col items-center mb-8 text-center">
        <img src={logoAponti} alt="Logo Aponti" className="w-40 drop-shadow-lg" />
        <h1 className="text-lg font-semibold mt-4">Bem-vindo(a) de volta!</h1>
        <p className="text-gray-dark text-sm max-w-xs mt-1">
          Gerencie suas garantias com facilidade e segurança
        </p>
      </div>

      <div className="w-full max-w-sm bg-gray rounded-xl p-6 shadow-xl flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Seu email"
          value={form.email}
          onChange={handleChange}
          className="bg-white border-none"
        />
        <Input
          label="Senha"
          type="password"
          name="senha"
          placeholder="Sua senha"
          value={form.senha}
          onChange={handleChange}
          className="bg-white border-none"
        />

        {/* Erro geral do formulário */}
        {error && <p className="text-xs text-red text-center">{error}</p>}

        <div className="mt-2 flex justify-center">
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Entrando..." : "Login"}
          </Button>
        </div>

        <button className="text-sm text-gray-dark hover:underline text-center" onClick={() => navigate("/forgot-password")}>
          Esqueceu a senha?
        </button>

        <div className="flex items-center gap-2">
          <div className="h-px bg-gray-medium flex-1" />
          <span className="text-xs text-gray-dark">ou</span>
          <div className="h-px bg-gray-medium flex-1" />
        </div>

        <Button variant="primary" onClick={() => navigate("/register")}>
          Criar nova conta
        </Button>

        <Button
          variant="primary"
          onClick={() => navigate("/home-demo")}
        >
          Entrar como visitante
        </Button>

      </div>
    </div>
  );
}