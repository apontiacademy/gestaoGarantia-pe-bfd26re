import React from 'react';
import Input from '../components/ui/Input';
import ActionButton from '../components/ui/ActionButton';
import logo from '../assets/logo.jpg';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      
      {/* Logo e Texto de Boas-vindas */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="mb-2">
           <img src={logo} alt="Logo Aponti" title='Logo Aponti' width={250} />
        </div>
        <p className="text-gray-500 text-sm max-w-50">
          Faça login para começar gerenciar suas garantias!
        </p>
      </div>

      {/* Container Cinza do Formulário (conforme o Figma) */}
      <div className="w-full max-w-sm bg-[#D9D9D9] rounded-2xl p-8 flex flex-col gap-4">
        
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

        <button className="text-xs text-gray-700 hover:underline text-center mt-1">
          Esqueceu a senha?
        </button>

        {/* Divisor "ou" */}
        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-gray-400 flex-1"></div>
          <span className="text-xs text-gray-500">ou</span>
          <div className="h-px bg-gray-400 flex-1"></div>
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