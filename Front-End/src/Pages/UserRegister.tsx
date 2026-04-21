import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import logobranco from "../assets/logos/logobranco2.svg"
import { Eye, EyeOff } from "lucide-react";

export default function UserRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!accepted) {
      alert("Você precisa aceitar os Termos e a Política de Privacidade.");
      return;
    }
    console.log("Criar conta:", form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      {/* Phone Frame */}
      <div className="w-[360px] bg-gray-100 rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="bg-primary py-1 px-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <img src={logobranco} alt="Logo" className="w-full h-30" />
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-7">
          <p className="text-gray-dark text-sm mb-6 text-center">
            Entre com suas credenciais para acessar
          </p>

          {/* Form Card */}
          <div className="bg-gray rounded-2xl p-5 flex flex-col gap-3">
            {/* Nome */}
            <Input
              label="Nome"
              type="text"
              name="nome"
              placeholder="Nome"
              value={form.nome}
              onChange={handleChange}
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            {/* Senha */}
            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
              />

              <button
                className="absolute right-3 top-[37px] cursor-pointer flex items-center hover:scale-110 transition"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? (
                  <Eye size={20} className="text-gray-700" />
                ) : (
                  <EyeOff size={20} className="text-gray-500" />
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="bg-yellow-light rounded-xl p-3 flex gap-2 items-start mt-1">
              <input
                type="checkbox"
                id="terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 mt-[2px] cursor-pointer accent-primary"
              />

              <label
                htmlFor="terms"
                className="text-xs text-gray-600 leading-relaxed"
              >
                Eu li e concordo com os{" "}
                <a href="#" className="font-semibold underline text-gray-dark">
                  Termos e Condições de Uso
                </a>{" "}
                e com a{" "}
                <a href="#" className="font-semibold underline text-gray-dark">
                  Política de Privacidade.
                </a>
              </label>
            </div>
          </div>

          {/* Button */}
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={handleSubmit}>
              Criar conta
            </Button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-dark mt-4">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="bg-primary h-8" />
      </div>
    </div>
  );
}
