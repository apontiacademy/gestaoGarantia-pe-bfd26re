import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import logoAponti from '../Assets/logos/logoAponti.svg';
import { authService } from '../services/authService';

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

  const handleSendEmail = async () => {
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
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'Erro ao enviar o código de verificação.'
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

  const handleVerifyCode = async () => {
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

    } catch (err: any) {
      console.error("❌ ERRO COMPLETO:", err);
      console.error("Response:", err.response?.data);

      const mensagem = err.response?.data?.error || 
                      err.response?.data?.message || 
                      err.message || 
                      'Erro desconhecido';

      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fundo px-8">
      <img src={logoAponti} alt="Logo Aponti" className="w-40 drop-shadow-lg mb-8" />

      <div className="w-full max-w-sm bg-gray rounded-xl p-6 shadow-xl flex flex-col gap-4">

        {step === 'email' ? (
          <>
            <h1 className="text-lg font-semibold text-center">Redefinir Senha</h1>
            <p className="text-sm text-gray-dark text-center">
              Insira seu email para receber o código de verificação.
            </p>

            <Input
              label="Email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="bg-white border-none"
            />

            {error && <p className="text-xs text-red text-center">{error}</p>}

            <Button 
              variant="primary" 
              onClick={handleSendEmail} 
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </Button>

            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm font-semibold text-gray-medium hover:text-primary-start transition-colors mx-auto"
            >
              <ArrowLeft size={18} />
              Voltar para o Login
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-center">Digite o código</h2>
            <p className="text-sm text-gray-dark text-center">
              Enviamos um código de 6 dígitos para<br />
              <strong>{email}</strong>
            </p>

            <div className="flex justify-center gap-3 my-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => { if (el) inputsRef.current[index] = el; }}
                  onChange={(e) => handleCodeChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-11 h-11 text-center text-2xl font-bold border border-gray-medium rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ))}
            </div>

            {error && <p className="text-xs text-red text-center">{error}</p>}

            <Button 
              variant="primary" 
              onClick={handleVerifyCode} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <button
              type="button"
              className="text-xs font-semibold text-gray-medium hover:text-primary-start transition-colors mx-auto"
            >
              Reenviar código
            </button>

            <button
              onClick={() => setStep('email')}
              className="flex items-center gap-2 text-sm font-semibold text-gray-medium hover:text-primary-start transition-colors mx-auto"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}