import { Upload, FileCheck, X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import ActionButton from '../components/ui/ActionButton';
import WarrantyCard from '../components/ui/WarrantyCard';
import LayoutHome from '../layout/LayoutHome';

const CreateWarranty: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hasExtendedWarranty, setHasExtendedWarranty] = useState(false);
  const [value, setValue] = useState('');
  const [step, setStep] = useState(1);
  const steps = [
    'Produto',
    'Compra',
    'Nota Fiscal',
    'Revisão',
  ];

  function formatCurrency(input: string) {
    const onlyNumbers = input.replace(/\D/g, '');
    const numberValue = Number(onlyNumbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(numberValue);
  }

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  }

  return (
    <LayoutHome
      namePage="Cadastro de Garantia"
      showMenu={false}
      showNotification={false}
      showBack
    >
      <div className="min-h-screen bg-fundo">
        <main className="p-6">
          <div className="bg-[#D9D9D9] rounded-3xl p-6 shadow-sm max-w-md mx-auto">

            {/* Título */}
            <h1 className="text-lg font-bold text-gray-800">
              Cadastro de Garantia
            </h1>

            <p className="text-sm text-gray-600 mb-6 font-medium">
              Preencha os dados da garantia
            </p>

            {/* Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((item, index) => {
                const currentStep = index + 1;
                return (
                  <div
                    key={item}
                    className="flex items-center flex-1"
                  >
                    <div className="flex flex-col items-center w-full">
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          text-sm font-bold border-2 transition-all
                          ${
                            step >= currentStep
                              ? 'bg-primary-start text-white border-primary-start'
                              : 'bg-white text-gray-400 border-gray-300'
                          }
                        `}
                      >
                        {currentStep}
                      </div>

                      <span className="text-xs mt-1 text-center">
                        {item}
                      </span>
                    </div>

                    {currentStep !== steps.length && (
                      <div
                        className={`
                          h-1 flex-1 mx-2 rounded transition-all
                          ${
                            step > currentStep
                              ? 'bg-primary-start'
                              : 'bg-gray-300'
                          }
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>

              {/* ETAPA 1 */}
              {step === 1 && (
                <>
                  <Input
                    label="Nome do Produto *"
                    placeholder="Ex: Notebook"
                    className="bg-white border-none"
                  />

                  <Input
                    label="Marca *"
                    placeholder="Ex: Lenovo"
                    className="bg-white border-none"
                  />

                  <Input
                    label="Modelo *"
                    placeholder="Ex: IdeaPad"
                    className="bg-white border-none"
                  />

                  <Input
                    label="Quantidade de Produto"
                    type="number"
                    min={0}
                    placeholder="Ex: 1"
                    className="bg-white border-none"
                  />

                  <div className="flex gap-4 items-end">

                    <Input
                      label="Período de Garantia *"
                      type="number"
                      min={0}
                      placeholder="Ex: 12"
                      className="flex-1 bg-white border-none"
                    />

                    <div className="flex gap-2 mb-3 text-xs font-bold text-gray-700">

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit"
                          className="accent-primary-start"
                        />
                        Dias
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit"
                          defaultChecked
                          className="accent-primary-start"
                        />
                        Meses
                      </label>

                    </div>
                  </div>
                </>
              )}

              {/* ETAPA 2 */}
              {step === 2 && (
                <>
                  <Input
                    label="Nome da Loja"
                    placeholder="Ex: FastShop"
                    className="bg-white border-none"
                  />

                  <Input
                    label="CNPJ da Loja"
                    type='text'
                    placeholder="00.000.000/0000-00"
                    onChange={(e) => {e.target.value = e.target.value.replace(/[^\d./-]/g, "");}}
                    className="bg-white border-none"
                  />

                  <Input
                    label="Data da Compra *"
                    type="date"
                    className="bg-white border-none text-gray-400"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split("T")[0]}
                  />

                  <Input
                    label="Valor"
                    type="text"
                    value={value}
                    placeholder="R$ 0,00"
                    onChange={(e) => {
                      setValue(formatCurrency(e.target.value));
                    }}
                    className="bg-white border-none"
                  />

                  {/* Garantia Estendida */}
                  <div className="flex flex-col gap-1">

                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      Garantia Estendida?
                    </label>

                    <select
                      className="
                        w-full px-4 py-2.5
                        bg-white border-none rounded-lg shadow-sm
                        focus:ring-2 focus:ring-primary-start
                        outline-none text-gray-600
                      "
                      onChange={(e) =>
                        setHasExtendedWarranty(
                          e.target.value === 'sim'
                        )
                      }
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>

                  {hasExtendedWarranty && (
                    <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">

                      <Input
                        label="Período Estendido"
                        placeholder="Ex: 12 dias"
                        className="bg-white border-none"
                      />

                      <Input
                        label="Número da Garantia Estendida"
                        type ="number"
                        placeholder="Ex: 9928..."
                        className="bg-white border-none"
                      />
                    </div>
                  )}
                </>
              )}

              {/* ETAPA 3 */}
              {step === 3 && (
                <>
                  <Input
                    label="Número da Nota Fiscal"
                    className="bg-white border-none"
                  />

                  {/* Observações */}
                  <div className="flex flex-col gap-1">

                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      Observações
                    </label>

                    <textarea
                      className="
                        w-full px-4 py-2
                        bg-white border-none rounded-lg
                        h-24
                        focus:ring-2 focus:ring-primary-start
                        outline-none shadow-sm
                      "
                      placeholder="Informações adicionais..."
                    />
                  </div>

                  {/* Upload */}
                  <div className="flex flex-col gap-1">

                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      Nota Fiscal (PDF ou Imagem)
                    </label>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`
                        border-2 border-dashed rounded-lg p-6
                        flex flex-col items-center justify-center
                        cursor-pointer transition-all
                        ${
                          file
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-medium hover:border-primary hover:bg-gray-50'
                        }
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
                          <Upload
                            className="text-gray-medium mb-2"
                            size={32}
                          />

                          <span className="text-sm text-gray-medium text-center">
                            Clique para fazer upload da nota fiscal
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">

                          <div className="flex items-center gap-3">

                            <FileCheck
                              className="text-green-600"
                              size={24}
                            />

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
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                            className="
                              p-1 hover:bg-red-100 rounded-full
                              text-red-500 transition-colors
                            "
                          >
                            <X size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ETAPA 4 */}
              {step === 4 && (
                <WarrantyCard
                  title="Notebook Lenovo IdeaPad"
                  purchaseDate="15/12/2025"
                  expirationDate="15/12/2026"
                  warrantyType={
                    hasExtendedWarranty
                      ? 'Garantia Estendida'
                      : 'Garantia Padrão'
                  }
                  value={value}
                  variant="home"
                />
              )}

              {/* BOTÕES */}
              <div className="flex flex-col gap-3 mt-6">

                {step < 4 ? (
                  <ActionButton
                    action="create"
                    variant="primary"
                    label="Continuar"
                    onClick={() => setStep(step + 1)}
                  />
                ) : (
                  <ActionButton
                    action="create"
                    variant="primary"
                    label="Salvar Garantia"
                  />
                )}

                <ActionButton
                  action="edit"
                  variant="ghost"
                  label={
                    step === 1
                      ? 'Cancelar'
                      : 'Voltar'
                  }
                  onClick={() => {
                    if (step === 1) {
                      navigate(-1);
                    } else {
                      setStep(step - 1);
                    }
                  }}
                />
              </div>
            </form>
          </div>
        </main>
      </div>
    </LayoutHome>
  );
};

export default CreateWarranty;