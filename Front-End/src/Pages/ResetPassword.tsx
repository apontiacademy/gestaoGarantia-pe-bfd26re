import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import logoAponti from '../Assets/logos/logoAponti.svg';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ novaSenha: '', confirmar: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.novaSenha || !form.confirmar) {
      setError('Preencha todos os campos.');
      return;
    }
    if (form.novaSenha !== form.confirmar) {
      setError('As senhas não coincidem.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      if (token) {
        await authService.resetPassword(token, form.novaSenha);
        alert('Senha redefinida com sucesso!');
        navigate('/login');
      } else {
        setError('Token de validação inválido ou ausente.');
      }
    } catch (err: unknown) {
      // Correção do erro 'Unexpected any': tipando como unknown e validando a instância
      const message = err instanceof Error ? err.message : 'Erro ao redefinir senha.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fundo flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <img src={logoAponti} alt="Logo Aponti" className="h-12 mb-2" />
        <h1 className="text-gray-dark text-4xl font-bold italic tracking-tighter">
          aponti<span className="text-[#9333EA]">.</span>
        </h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-dark mb-6">
          Criar uma nova senha?
        </h2>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-dark mb-1">
              Nova senha
            </label>
            <div className="relative">
              {/* Correção: Removida a propriedade 'label' ausente no componente Input */}
              <Input
              label=''
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua nova senha"
                value={form.novaSenha}
                onChange={(e) => setForm({ ...form, novaSenha: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-dark mb-1">
              Confirmar Senha
            </label>
            <div className="relative">
              {/* Correção: Removida a propriedade 'label' ausente no componente Input */}
              <Input
              label=''
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirme sua nova senha"
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#9333EA] text-white py-3 rounded-xl font-semibold mt-2">
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>

        <button
          onClick={() => navigate('/login')}
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 w-full hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para o Login
        </button>
      </div>
    </div>
  );
}