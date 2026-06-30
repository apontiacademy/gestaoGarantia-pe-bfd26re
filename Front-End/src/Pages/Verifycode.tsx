import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function VerifyCode() {
  const navigate = useNavigate();
  
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']); // 6 dígitos
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  // ==================== DIGITAR CÓDIGO ====================
  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1); // pega só o último caractere
    setCode(newCode);

    // Auto-focus no próximo campo
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ==================== BACKSPACE ====================
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }

    // Permite colar código completo (melhoria importante)
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      // Não faz nada aqui, o onPaste vai tratar
    }
  };

  // ==================== COLAR CÓDIGO COMPLETO ====================
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) { // verifica se são exatamente 6 números
      const pastedCode = pastedData.split('');
      setCode(pastedCode);
      inputsRef.current[5]?.focus(); // foca no último campo
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      alert('Por favor, digite o código completo de 6 dígitos.');
      return;
    }

    setLoading(true);

    // Aqui você vai chamar a API
    console.log("Código digitado:", fullCode);
    
    // Simulação de delay
    setTimeout(() => {
      navigate('/reset-password');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-fundo flex flex-col items-center justify-center p-4">
      <div className="mb-10 text-center">
        <h1 className="text-white text-4xl font-bold italic tracking-tighter">
          aponti<span className="text-primary-end">.</span>
        </h1>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
        <header className="mb-6">
          <h2 className="text-gray-dark text-xl font-bold">
            Acabamos de enviar um código para seu e-mail
          </h2>
          <p className="text-gray-medium mt-2 text-sm">
            Insira o código de verificação de <strong>6 dígitos</strong>
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3 my-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`verify-code-${index}`}
                name={`verify-code-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Dígito ${index + 1} do código de verificação`}
                maxLength={1}
                value={digit}
                ref={(el) => { if (el) inputsRef.current[index] = el; }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-2xl font-bold border border-gray-medium rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            ))}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-3"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </Button>

          <button 
            type="button" 
            className="text-xs font-semibold text-gray-medium hover:text-primary-start transition-colors block mx-auto"
          >
            Reenviar código
          </button>
        </form>

        <p className="text-[10px] text-gray-medium mt-6">
          Não recebeu o email? Verifique a pasta de Spam ou lixo eletrônico.
        </p>

        <footer className="mt-6 pt-4 border-t border-gray-100">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-medium hover:text-primary-start transition-colors mx-auto"
          >
            <ArrowLeft size={18} /> Voltar
          </button>
        </footer>
      </div>
    </div>
  );
}