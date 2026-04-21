import React from 'react';
import Input from '../components/ui/Input';
import ActionButton from '../components/ui/ActionButton';
//import logo from '../assets/logos/logo.jpg';
import logoAponti from '../assets/logos/logoAponti.svg'

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fundo px-8">

      {/* Logo e Texto de Boas-vindas */}
      <div className="flex flex-col items-center mb-8 text-center">
        <img src={logoAponti} alt="Logo Aponti" title='Logo Aponti' className="w-40 drop-shadow-lg" />

        <h1 className="text-lg font-semibold">
          Bem-vindo(a) de volta!
        </h1>

        <p className="text-gray-dark text-sm max-w-xs mt-1">
          Gerencie suas garantias com facilidade e segurança
        </p>
      </div>

      {/* Container Cinza do Formulário (conforme o Figma) */}
      <div className="w-full max-w-sm bg-gray backdrop-blur-xl rounded-xl p-6 shadow-xl flex flex-col gap-4">

        <Input
          label="Email"
          type="email"
          placeholder="Seu email"
          className="bg-white border-none"
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Sua senha"
          className="bg-white border-none"
        />

        <div className="mt-2 flex justify-center" >
          {/* Botão de Login - Variante Primary (Roxo) */}
          <ActionButton
            action="create"
            variant="primary"
            label="Login"
            onClick={() => console.log("Fazendo login...")}
          />
        </div>

        <button className="text-sm text-gray-dark hover:underline text-center cursor-pointer">
          Esqueceu a senha?
        </button>

        {/* Divisor "ou" */}
        <div className="flex items-center gap-2">
          <div className="h-px bg-gray-medium flex-1"></div>
          <span className="text-xs text-gray-dark">ou</span>
          <div className="h-px bg-gray-medium flex-1"></div>
        </div>

        {/* Botão Criar Conta - Usando a mesma variante roxa do Figma */}
        <ActionButton
          action="create"
          variant="primary"
          label="Criar nova conta"
          onClick={() => console.log("Ir para cadastro")}
        />
      </div>
    </div>
  );
};

export default Login;