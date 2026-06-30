import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import simboloAponti from "../Assets/logos/simboloAponti.svg"
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../utils/apiError';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState<string>('');
  const [form, setForm] = useState({ novaSenha: '', confirmar: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pegar o token vindo da tela anterior (via navigate state)
  useEffect(() => {
    const stateToken = location.state?.token;
    
    if (stateToken) {
      setToken(stateToken);
    } else {
      // Fallback: tentar pegar da URL (caso o usuário cole o link)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        setToken(urlToken);
      } else {
        setError('Token não encontrado. Solicite um novo código.');
      }
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.novaSenha || !form.confirmar) {
      setError('Preencha todos os campos.');
      return;
    }
    if (form.novaSenha.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (form.novaSenha !== form.confirmar) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!token) {
      setError('Token inválido. Volte e solicite um novo código.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, form.novaSenha);
      
      navigate('/login', {
        state: { message: 'Senha redefinida com sucesso! Faça login.' },
      });
    } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Erro ao redefinir senha. Tente novamente.'));
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
            <h1 className="text-xl font-bold">Nova Senha</h1>
            <p className="text-sm text-gray-dark text-center">
              Escolha uma senha segura para sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Nova senha"
              type={showPassword ? 'text' : 'password'}
              name="novaSenha"
              placeholder="Mínimo 6 caracteres"
              value={form.novaSenha}
              onChange={handleChange}
              autoComplete="new-password"
              className="bg-white border border-gray/50"
              rightIcon={showPassword ? <Eye size={18} className="cursor-pointer" /> : <EyeOff size={18} className="cursor-pointer" />}
              onRightIconClick={() => setShowPassword((v) => !v)}
            />

            <Input
              label="Confirmar senha"
              type={showPassword ? 'text' : 'password'}
              name="confirmar"
              placeholder="Repita a nova senha"
              value={form.confirmar}
              onChange={handleChange}
              autoComplete="new-password"
              className="bg-white border border-gray/50"
            />

            {error && <p className="text-xs text-red text-center">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading || !token} className="w-full">
              {loading ? 'Salvando...' : 'Redefinir Senha'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-medium text-gray-dark hover:text-primary transition-colors text-center"
          >
            Solicitar novo código
          </button>
        </div>
      </div>
    </div>
  );
}