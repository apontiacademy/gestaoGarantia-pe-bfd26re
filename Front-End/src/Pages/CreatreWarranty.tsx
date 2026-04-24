import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import ActionButton from '../components/ui/ActionButton';

const CreateWarranty: React.FC = () => {
  const navigate = useNavigate();
  const [hasExtendedWarranty, setHasExtendedWarranty] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center px-6 py-4 border-b border-gray-100">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={28} className="text-gray-800" />
        </button>
        <h1 className="ml-2 text-xl font-bold text-primary">Cadastro de Garantia</h1>
      </header>

      <main className="p-6">
        {/*(Container igual ao WarrantyCard) */}
        <div className="bg-[#D9D9D9] rounded-3xl p-6 shadow-sm max-w-md mx-auto">
            <h1 className="text-lg font-bold text-gray-800">Cadastre seu Produto</h1>
          <p className="text-sm text-gray-600 mb-6 font-medium">
            Preencha os dados da nota fiscal e produto
          </p>

          <form className="flex flex-col gap-4">
            <Input 
              label="Nome do Produto *" 
              placeholder="Ex: Notebook Lenovo Ideapad" 
              className="bg-white border-none" // Input branco dentro do fundo cinza
            />
            
            <div className="flex gap-4 items-end">
              <Input 
                label="Período de Garantia *" 
                placeholder="Ex: 12" 
                className="flex-1 bg-white border-none" 
              />
              <div className="flex gap-2 mb-3 text-xs font-bold text-gray-700">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="unit" className="accent-primary-start" /> DIAS
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="unit" defaultChecked className="accent-primary-start" /> MESES
                </label>
              </div>
            </div>

            <Input label="Quantidade de Produto" type="number" className="bg-white border-none" />
            <Input label="Nome da Loja" placeholder="Ex: FastShop" className="bg-white border-none" />
            <Input label="CNPJ da Loja" placeholder="00.000.000/0000-00" className="bg-white border-none" />
            <Input label="Data da Compra *" type="date" className="bg-white border-none text-gray-400" />

            {/* Garantia Estendida */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Garantia Estendida?</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border-none rounded-lg shadow-sm focus:ring-2 focus:ring-primary-start outline-none text-gray-600"
                onChange={(e) => setHasExtendedWarranty(e.target.value === 'sim')}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            {hasExtendedWarranty && (
              <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                <Input label="Período Estendido" placeholder="Ex: 12" className="bg-white border-none" />
                <Input label="Número da Garantia Estendida" placeholder="Ex: 9928..." className="bg-white border-none" />
              </div>
            )}

            <Input label="Número da Nota Fiscal" className="bg-white border-none" />
            <Input label="Valor" type="number" placeholder="R$ 0,00" className="bg-white border-none" />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Observações</label>
              <textarea 
                className="w-full px-4 py-2 bg-white border-none rounded-lg h-24 focus:ring-2 focus:ring-primary-start outline-none shadow-sm"
                placeholder="Informações adicionais..."
              />
            </div>

            {/* Seção de Anexo */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mt-2">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Selecione um ou mais documentos</p>
              <button type="button" className="text-sm font-bold text-gray-800 border border-black px-4 py-1 rounded-md">
                Anexar Nota
              </button>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3 mt-6">
              <ActionButton 
                action="create" 
                variant="primary" 
                label="Salvar Garantia" 
              />
              <ActionButton 
                action="edit" 
                variant="ghost" 
                label="Cancelar" 
                onClick={() => navigate(-1)}
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateWarranty;