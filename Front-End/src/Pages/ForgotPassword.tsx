import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import simboloAponti from "../Assets/logos/simboloAponti.svg"
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../utils/apiError';

type Step = 'email' | 'code';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState<string>('');

  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Informe seu email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }

      setStep('code');
      setError('');
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, 'Erro ao enviar o código de verificação.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('').trim();

    if (fullCode.length !== 6) {
      setError('Digite o código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log("🔍 Enviando verificação:", { 
        token: resetToken ? "presente" : "faltando", 
        codigo: fullCode 
      });

      await authService.verifyResetCode(resetToken, fullCode);
      
      console.log("✅ Código validado com sucesso!");
      navigate('/reset-password', { state: { token: resetToken } });

    } catch (err: unknown) {
      console.error("❌ ERRO COMPLETO:", err);
      if (err && typeof err === "object" && "response" in err) {
        console.error("Response:", (err as { response?: { data?: unknown } }).response?.data);
      }

      setError(getApiErrorMessage(err, 'Código inválido ou expirado.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-fundo">
      <div className="w-full flex items-center justify-center px-2 bg-fundo">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-10 py-12 flex flex-col gap-5">

          <div className="flex flex-col items-center gap-2 mb-2">
            <img src={simboloAponti} alt="Símbolo Aponti" className="w-16" />
            {step === 'email' ? (
              <>
                <h1 className="text-xl font-bold">Redefinir Senha</h1>
                <p className="text-sm text-gray-dark text-center">
                  Insira seu email para receber o código de verificação.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold">Digite o código</h1>
                <p className="text-sm text-gray-dark text-center">
                  Enviamos um código de 6 dígitos para <strong>{email}</strong>
                </p>
              </>
            )}
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendEmail} className="flex flex-col gap-5">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                className="bg-white border border-gray/50"
              />

              {error && <p className="text-xs text-red text-center">{error}</p>}

              <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-dark hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar para o Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Dígito ${index + 1}`}
                    maxLength={1}
                    value={digit}
                    ref={(el) => { if (el) inputsRef.current[index] = el; }}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-2xl font-bold border border-gray/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ))}
              </div>

              {error && <p className="text-xs text-red text-center">{error}</p>}

              <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>

              <button
                type="button"
                className="text-xs font-medium text-gray-dark hover:text-primary transition-colors text-center"
              >
                Reenviar código
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-dark hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}