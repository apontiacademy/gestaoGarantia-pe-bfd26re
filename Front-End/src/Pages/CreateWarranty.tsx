import { Upload, FileCheck, X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import ActionButton from '../components/ui/ActionButton';

const CreateWarranty: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hasExtendedWarranty, setHasExtendedWarranty] = useState(false);

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  }

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
              placeholder="Ex: Notebook " 
              className="bg-white border-none" // Input branco dentro do fundo cinza
            />
            
              <Input
                label="Marca *"
                placeholder="Ex: Lenovo"
                className="flex-1 bg-white border-none"
              />
            <Input
              label="Modelo *"
              placeholder="Ex: IdeaPad 320"
              className="flex-1 bg-white border-none"
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
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nota Fiscal (PDF ou Imagem)</label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${file ? 'border-green-500 bg-green-50' : 'border-gray-medium hover:border-primary hover:bg-gray-50'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />

                {!file ? (
                  <>
                    <Upload className="text-gray-medium mb-2" size={32} />
                    <span className="text-sm text-gray-medium text-center">
                      Clique para fazer upload da nota fiscal
                    </span>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <FileCheck className="text-green-600" size={24} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-dark truncate max-w-50">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-medium">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
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