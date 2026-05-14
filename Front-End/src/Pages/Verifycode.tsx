import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function VerifyCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  // Pular automaticamente para o próximo quadradinho ao digitar
  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // Aceita apenas números
    
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1); // Pega apenas o último caractere
    setCode(newCode);

    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // voltar ao quadradinho anterior ao apagar (Backspace)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    console.log("Código digitado:", fullCode);
    // Avança para a próxima tela do fluxo
    navigate('/reset-password');
  };

  return (
    <div className="min-h-screen bg-fundo flex flex-col items-center justify-center p-4">
      {/* Logo Aponti */}
      <div className="mb-10 text-center">
        <h1 className="text-white text-4xl font-bold italic tracking-tighter">
          aponti<span className="text-[var(--color-primary-end)]">.</span>
        </h1>
      </div>

      {/* Card Principal */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
        <header className="mb-6">
          <h2 className="text-gray-dark text-xl font-bold max-w-[280px] mx-auto leading-tight">
            Acabamos de enviar um código para seu e-mail
          </h2>
          <p className="text-gray-medium mt-2 text-xs">
            Insira no campo abaixo o código de verificação de 5 dígitos enviado para o seu e-mail.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid com os 5 Inputs do Código */}
          <div className="flex justify-center gap-3 my-4">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => { if (el) inputsRef.current[index] = el; }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-medium rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-dark"
                required
              />
            ))}
          </div>

          <button 
            type="button" 
            className="text-xs font-semibold text-gray-medium hover:text-[var(--color-primary-start)] transition-colors block mx-auto mb-4"
          >
            Reenviar código
          </button>

          <Button type="submit" variant="primary" className="w-full py-3">
            Enviar
          </Button>
        </form>

        <p className="text-[10px] text-gray-medium mt-6 max-w-[300px] mx-auto">
          Dica: Caso não encontre o e-mail na sua caixa de entrada, verifique a pasta de Spam.
        </p>

        <footer className="mt-6 flex justify-center border-t border-gray-100 pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-medium hover:text-[var(--color-primary-start)] transition-colors"
          >
            <ArrowLeft size={18} /> Voltar
          </button>
        </footer>
      </div>
    </div>
  );
}