import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import logoAponti from '../Assets/logos/logoAponti.svg';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Informe seu email.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setEnviado(true); // mostra tela de confirmação
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fundo px-8">
      <img src={logoAponti} alt="Logo Aponti" className="w-40 drop-shadow-lg mb-6" />

      <div className="w-full max-w-sm bg-gray rounded-xl p-6 shadow-xl flex flex-col gap-4">

        {/* Tela de confirmação após envio */}
        {enviado ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <CheckCircle size={48} className="text-green" />
            <h1 className="text-lg font-semibold">Email enviado!</h1>
            <p className="text-sm text-gray-dark">
              Verifique sua caixa de entrada em <strong>{email}</strong> e siga
              as instruções para redefinir sua senha.
            </p>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Voltar para o login
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-center">Redefinir Senha</h1>
            <p className="text-sm text-gray-dark text-center">
              Insira seu email para receber as instruções.
            </p>

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="bg-white border-none"
            />

            {error && (
              <p className="text-xs text-red text-center">{error}</p>
            )}

            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>

            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm font-semibold text-gray-medium hover:text-primary-start transition-colors"
            >
              <ArrowLeft size={18} />
              Voltar para o Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}