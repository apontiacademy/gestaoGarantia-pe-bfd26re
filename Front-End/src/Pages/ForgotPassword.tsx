import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import logoAponti from '../Assets/logos/logoAponti.svg';

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fundo px-8">
      <img src={logoAponti} alt="Logo Aponti" className="w-40 drop-shadow-lg mb-6" />

      <div className="w-full max-w-sm bg-gray rounded-xl p-6 shadow-xl flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-center">Redefinir Senha</h1>
        <p className="text-sm text-gray-dark text-center">
          Insira seu email para receber as instruções.
        </p>

        <Input label="Email" type="email" placeholder="Seu email" className="bg-white border-none" />

        <Button variant="primary" onClick={() => console.log("Enviar email")}>
          Enviar
        </Button>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-medium hover:text-[var(--color-primary-start)] transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar para o Login
        </button>
      </div>
    </div>
  );
}