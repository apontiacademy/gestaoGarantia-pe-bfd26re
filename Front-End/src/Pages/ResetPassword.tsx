import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import logoAponti from '../Assets/logos/logoAponti.svg';
import { authService } from '../services/authService';

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

  const handleSubmit = async () => {
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
    } catch (err: any) {
        const mensagem = err.response?.data?.error;
        
        if (mensagem) {
          setError(mensagem);
        } else {
          setError('Erro ao redefinir senha. Tente novamente.');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fundo px-8">
      <img src={logoAponti} alt="Logo Aponti" className="w-40 drop-shadow-lg mb-6" />

      <div className="w-full max-w-sm bg-gray rounded-xl p-6 shadow-xl flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-center">Nova Senha</h1>
        <p className="text-sm text-gray-dark text-center">
          Escolha uma senha segura para sua conta.
        </p>

        <div className="relative">
          <Input
            label="Nova senha"
            type={showPassword ? 'text' : 'password'}
            name="novaSenha"
            placeholder="Mínimo 6 caracteres"
            value={form.novaSenha}
            onChange={handleChange}
            className="bg-white border-none"
          />
          <button
            type="button"
            className="absolute right-3 top-[37px] cursor-pointer hover:scale-110 transition"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <Input
          label="Confirmar senha"
          type={showPassword ? 'text' : 'password'}
          name="confirmar"
          placeholder="Repita a senha"
          value={form.confirmar}
          onChange={handleChange}
          className="bg-white border-none"
        />

        {error && (
          <p className="text-xs text-red text-center">{error}</p>
        )}

        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || !token}
        >
          {loading ? 'Salvando...' : 'Redefinir Senha'}
        </Button>

        <button
          onClick={() => navigate('/forgot-password')}
          className="text-sm font-semibold text-gray-medium hover:text-primary-start transition-colors"
        >
          Solicitar novo código
        </button>
      </div>
    </div>
  );
}