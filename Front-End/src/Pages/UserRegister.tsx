import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Eye, EyeOff, } from "lucide-react";
import { authService } from "../services/authService";
import simboloAponti from "../Assets/logos/simboloAponti.svg";

export default function UserRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.email || !form.senha || !form.confirmarSenha) {
      setError("Preencha todos os campos.");
      return;
    }
    if (form.senha.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await authService.register(form);
      navigate("/login", {
        state: { message: "Conta criada com sucesso! Faça login para continuar." },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-fundo">

      {/* LADO ESQUERDO BRANCO */}
      <div className="w-full flex items-center justify-center px-2 bg-fundo">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-10 py-12 flex flex-col gap-5">

          <div className="flex flex-col items-center gap-2 mb-2">
            <img src={simboloAponti} alt="Símbolo Aponti" className="w-16" />
            <h1 className="text-xl font-bold text-gray-dark">Crie sua conta</h1>
            <p className="text-sm text-gray-dark text-center">
              Comece a organizar e acompanhar suas garantias em um só lugar.
            </p>
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Digite seu email"
            value={form.email}
            onChange={handleChange}
            className="bg-white border border-gray/50"
          />

          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            name="senha"
            placeholder="Digite sua senha"
            value={form.senha}
            onChange={handleChange}
            className="bg-white border border-gray/50"
            rightIcon={showPassword ? <EyeOff size={18} className="cursor-pointer" /> : <Eye size={18} className="cursor-pointer" />}
            onRightIconClick={() => setShowPassword((v) => !v)}
          />

          <Input
            label="Confirme sua Senha"
            type={showConfirm ? "text" : "password"}
            name="confirmarSenha"
            placeholder="Digite sua senha novamente"
            value={form.confirmarSenha}
            onChange={handleChange}
            className="bg-white border border-gray/50"
            rightIcon={showConfirm ? <EyeOff size={18} className="cursor-pointer" /> : <Eye size={18} className="cursor-pointer" />}
            onRightIconClick={() => setShowConfirm((v) => !v)}
          />
          {error && (
            <p className="text-xs text-red text-center -mt-2">{error}</p>
          )}

          <Button variant="primary" onClick={handleSubmit} disabled={loading} className="w-full cursor-pointer">
            {loading ? "Criando..." : "Criar Conta"}
          </Button>

          <p className="text-sm text-gray-dark text-center font-medium">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline cursor-pointer">
              Fazer login
            </Link>
          </p>
        </div>
      </div>

      {/* LADO DIREITO ROXXO*/}
      
    </div>
  );
}