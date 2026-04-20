import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import logobranco from "../Assets/logos/logobranco2.svg"

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
        <div className="bg-purple-700 py-1 px-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <img src={logobranco} alt="Logo" className="w-full h-30" />
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-7">
          <p className="text-gray-600 text-sm mb-6 text-center">
            Entre com suas credenciais para acessar
          </p>

          {/* Form Card */}
          <div className="bg-gray-200 rounded-2xl p-5 flex flex-col gap-3">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer flex items-center"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? (
                  <div className="flex items-center justify-center w-6 h-6">
                    <svg
                      className="w-4 h-4 flex"
                      width="30"
                      height="20"
                      viewBox="0 -20 5 40"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                ) : (
                  <div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 -20 5 40"
                      fill="none"
                      stroke="#767676"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="bg-yellow-100 rounded-xl p-3 flex gap-2 items-start mt-1">
              <input
                type="checkbox"
                id="terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 mt-[2px] cursor-pointer accent-purple-700"
              />

              <label
                htmlFor="terms"
                className="text-xs text-gray-600 leading-relaxed"
              >
                Eu li e concordo com os{" "}
                <a href="#" className="font-semibold underline text-gray-800">
                  Termos e Condições de Uso
                </a>{" "}
                e com a{" "}
                <a href="#" className="font-semibold underline text-gray-800">
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
          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-purple-700 font-semibold underline"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="bg-purple-700 h-8" />
      </div>
    </div>
  );
}
