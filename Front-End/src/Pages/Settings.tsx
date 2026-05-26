import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LayoutHome from '../layout/LayoutHome';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

type Section = 'profile' | 'password';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [section, setSection] = useState<Section>('profile');

  // ── Perfil ──────────────────────────────────────────────
  const [nomeCompleto, setNomeCompleto] = useState(user?.nomeCompleto ?? '');
  const [fotoPreview, setFotoPreview] = useState<string>(user?.fotoPerfil ?? '');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Senha ────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmar: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── Handlers de foto ─────────────────────────────────────
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('A imagem precisa ter menos de 5MB.');
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file)); // preview local imediato
    setProfileError('');
  };

  // ── Salvar perfil ────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!nomeCompleto.trim()) {
      setProfileError('O nome não pode estar vazio.');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      let fotoUrl = user?.fotoPerfil ?? '';

      // Se selecionou foto nova, faz upload pro Cloudinary primeiro
      if (fotoFile) {
        fotoUrl = await uploadImageToCloudinary(fotoFile);
      }

      const updated = await userService.updateProfile({
        nomeCompleto: nomeCompleto.trim(),
        fotoPerfil: fotoUrl,
      });

      // Atualiza o contexto sem precisar relogar
      updateUser({
        nomeCompleto: updated.nomeCompleto,
        fotoPerfil: updated.fotoPerfil,
      });

      setFotoFile(null);
      setProfileSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'Erro ao salvar perfil.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Trocar senha ─────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passwordForm.senhaAtual || !passwordForm.novaSenha || !passwordForm.confirmar) {
      setPasswordError('Preencha todos os campos.');
      return;
    }
    if (passwordForm.novaSenha.length < 6) {
      setPasswordError('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (passwordForm.novaSenha !== passwordForm.confirmar) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await userService.changePassword({
        senhaAtual: passwordForm.senhaAtual,
        novaSenha: passwordForm.novaSenha,
      });

      setPasswordForm({ senhaAtual: '', novaSenha: '', confirmar: '' });
      setPasswordSuccess('Senha alterada com sucesso!');
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Erro ao alterar senha.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = user?.nomeCompleto
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <LayoutHome>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="p-2 rounded-lg hover:bg-gray transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Configurações</h1>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSection('profile')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              section === 'profile'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-dark hover:bg-gray'
            }`}
          >
            Meu Perfil
          </button>
          <button
            onClick={() => setSection('password')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              section === 'password'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-dark hover:bg-gray'
            }`}
          >
            Trocar Senha
          </button>
        </div>

        {/* ── Seção: Perfil ── */}
        {section === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold border-4 border-gray">
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-yellow-button hover:bg-yellow-hover text-black rounded-full p-2 shadow transition"
                >
                  <Camera size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-medium">JPG ou PNG • máx. 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>

            {/* Campos */}
            <Input
              label="Nome completo"
              type="text"
              value={nomeCompleto}
              onChange={(e) => {
                setNomeCompleto(e.target.value);
                setProfileError('');
                setProfileSuccess('');
              }}
            />

            {/* Email — só leitura */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Email
              </label>
              <p className="w-full px-4 py-2 bg-gray border border-gray rounded-lg text-gray-medium text-sm">
                {user?.email}
              </p>
              <span className="text-xs text-gray-medium ml-1">
                O email não pode ser alterado.
              </span>
            </div>

            {profileError && (
              <p className="text-xs text-red text-center">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-xs text-green text-center">{profileSuccess}</p>
            )}

            <Button
              variant="primary"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                'Salvando...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save size={16} /> Salvar alterações
                </span>
              )}
            </Button>
          </div>
        )}

        {/* ── Seção: Senha ── */}
        {section === 'password' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound size={18} className="text-primary" />
              <p className="text-sm text-gray-dark">
                Você precisará da sua senha atual para confirmar a alteração.
              </p>
            </div>

            <div className="relative">
              <Input
                label="Senha atual"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Digite sua senha atual"
                value={passwordForm.senhaAtual}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, senhaAtual: e.target.value });
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
              />
            </div>

            <div className="relative">
              <Input
                label="Nova senha"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={passwordForm.novaSenha}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, novaSenha: e.target.value });
                  setPasswordError('');
                }}
              />
            </div>

            <div className="relative">
              <Input
                label="Confirmar nova senha"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Repita a nova senha"
                value={passwordForm.confirmar}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmar: e.target.value });
                  setPasswordError('');
                }}
              />
            </div>

            {/* Toggle mostrar senhas */}
            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              className="flex items-center gap-2 text-xs text-gray-medium hover:text-gray-dark transition self-start ml-1"
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
            </button>

            {passwordError && (
              <p className="text-xs text-red text-center">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-xs text-green text-center">{passwordSuccess}</p>
            )}

            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </div>
        )}
      </div>
    </LayoutHome>
  );
}