import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react'; // Biblioteca que você especificou no Figma

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // lógica de integração com o backend 
    console.log("Recuperação solicitada");
  };

  return (
    
    <div className="min-h-screen bg-fundo flex flex-col items-center justify-center p-4">
      
      {/* Logo Aponti  */}
      <div className="mb-10 text-center">
        <h1 className="text-white text-4xl font-bold italic tracking-tighter">
          aponti<span className="text-[var(--color-primary-end)]">.</span>
        </h1>
      </div>

      { }
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <header className="mb-8">
          <h2 className="text-gray-dark text-2xl font-bold">Esqueceu sua senha?</h2>
          <p className="text-gray-medium mt-2 text-sm">
            Digite seu e-mail cadastrado. Enviaremos um link para você redefinir sua senha com segurança.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input 
            label="E-mail"
            type="email"
            placeholder="exemplo@email.com"
            required
            />
          
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-3"
          >
            Enviar Instruções
          </Button>
        </form>

        <footer className="mt-8 flex justify-center border-t border-gray-100 pt-6">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm font-semibold text-gray-medium hover:text-[var(--color-primary-start)] transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar para o Login
          </button>
        </footer>
      </div>
    </div>
  );
}