import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, Upload, FileCheck, X } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function WarrantyRegister() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    purchaseDate: '',
    duration: '',
    place: '',
    type: 'individual'
  });

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => setFile(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No envio, você mandaria o formData + o arquivo (file)
    console.log("Dados:", formData, "Arquivo:", file);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-fundo p-6">
      <header className="max-w-2xl mx-auto flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-medium hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h1 className="text-white text-xl font-bold">Nova Garantia</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <PlusCircle className="text-primary" size={28} />
          <div>
            <h2 className="text-gray-dark text-lg font-bold">Cadastrar Item</h2>
            <p className="text-gray-medium text-sm">Preencha os dados e anexe a nota fiscal.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input 
                label="Nome do Produto / Item"
                placeholder="Ex: Notebook Dell XPS"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <Input 
              label="Data da Compra"
              type="date"
              required
              value={formData.purchaseDate}
              onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
            />

            <Input 
              label="Prazo (meses)"
              type="number"
              placeholder="12"
              required
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            />

            {/* Upload de Nota Fiscal */}
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
                        <span className="text-sm font-bold text-gray-dark truncate max-w-[200px]">
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
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-10">
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Save size={20} />
              Salvar Garantia
            </Button>
            
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate(-1)}
              className="md:w-1/3 py-3"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}