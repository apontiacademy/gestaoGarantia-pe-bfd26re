import { FileCheck } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import ActionButton from '../components/ui/ActionButton';
import LayoutHome from '../layout/LayoutHome';
import WarrantyAttachmentUpload from '../components/warranty/WarrantyAttachmentUpload';
import { useWarranty } from '../contexts/WarrantyContext';
import {
  computeExpirationDateBR,
  formatDateBRFromIso,
} from '../utils/warrantyDates';
import { fileToAttachment } from '../utils/warrantyAttachments';
import { formatCnpj } from '../utils/cnpj';

const CreateWarranty: React.FC = () => {
  const navigate = useNavigate();
  const { addWarranty } = useWarranty();
  const [files, setFiles] = useState<File[]>([]);
  const [hasExtendedWarranty, setHasExtendedWarranty] = useState(false);
  const [value, setValue] = useState('');
  const [step, setStep] = useState(1);

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [warrantyUnit, setWarrantyUnit] = useState<'days' | 'months'>('months');

  const [storeName, setStoreName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [extendedExtraMonths, setExtendedExtraMonths] = useState('');
  const [extendedWarrantyNumber, setExtendedWarrantyNumber] = useState('');

  const [nfNumber, setNfNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const steps = ['Produto', 'Compra', 'Nota Fiscal', 'Revisão'];

  function formatCurrency(input: string) {
    const onlyNumbers = input.replace(/\D/g, '');
    const numberValue = Number(onlyNumbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(numberValue);
  }

  const periodNum = Number(warrantyPeriod);
  const extraMonths = hasExtendedWarranty
    ? Math.max(0, Number(extendedExtraMonths) || 0)
    : 0;

  const purchaseDateDisplay = useMemo(
    () => formatDateBRFromIso(purchaseDate),
    [purchaseDate]
  );

  const expirationDateDisplay = useMemo(() => {
    if (!purchaseDate || !periodNum || periodNum <= 0) return '';
    return computeExpirationDateBR(
      purchaseDate,
      periodNum,
      warrantyUnit,
      extraMonths
    );
  }, [purchaseDate, periodNum, warrantyUnit, extraMonths]);

  const warrantyTypeLabel = hasExtendedWarranty
    ? 'Garantia Estendida'
    : 'Garantia de fábrica';


  async function handleSaveWarranty(): Promise<void> {
    const name = productName.trim();
    if (!name) {
      window.alert('Informe o nome do produto.');
      return;
    }
    if (!purchaseDate) {
      window.alert('Informe a data da compra.');
      return;
    }
    if (!periodNum || periodNum <= 0) {
      window.alert('Informe o período de garantia.');
      return;
    }
    const expiration = computeExpirationDateBR(
      purchaseDate,
      periodNum,
      warrantyUnit,
      extraMonths
    );
    if (!expiration) {
      window.alert('Não foi possível calcular a data de vencimento.');
      return;
    }

    const nf = nfNumber.trim();
    const b = brand.trim();
    const m = model.trim();

    let attachments;
    if (files.length > 0) {
      setIsSaving(true);
      try {
        attachments = await Promise.all(files.map((file) => fileToAttachment(file)));
      } catch (err) {
        setIsSaving(false);
        window.alert(
          err instanceof Error ? err.message : 'Não foi possível processar os arquivos.'
        );
        return;
      }
    }

    try {
      setIsSaving(true);
      await addWarranty({
        productName: name,
        brand: b,
        model: m,
        purchaseDate,
        warrantyPeriod: periodNum,
        warrantyUnit,
        hasExtendedWarranty,
        extendedExtraMonths: extraMonths,
        extendedWarrantyNumber: extendedWarrantyNumber.trim() || undefined,
        storeName: storeName.trim() || undefined,
        cnpj: cnpj.trim() ? formatCnpj(cnpj) : undefined,
        nfNumber: nf || undefined,
        quantity: quantity.trim() || undefined,
        value: value || undefined,
        notes: notes.trim() || undefined,
        attachments,
      });
      
      navigate('/home');
    } catch (error) {
      console.log(error);
      window.alert('Não foi possível salvar a garantia.');
    } finally {
      setIsSaving(false);
    }
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
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />

                  <Input
                    label="Marca *"
                    placeholder="Ex: Lenovo"
                    className="bg-white border-none"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />

                  <Input
                    label="Modelo *"
                    placeholder="Ex: IdeaPad"
                    className="bg-white border-none"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />

                  <Input
                    label="Quantidade de Produto"
                    type="number"
                    min={0}
                    placeholder="Ex: 1"
                    className="bg-white border-none"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />

                  <div className="flex gap-4 items-end">

                    <Input
                      label="Período de Garantia *"
                      type="number"
                      min={0}
                      placeholder="Ex: 12"
                      className="flex-1 bg-white border-none"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                    />

                    <div className="flex gap-2 mb-3 text-xs font-bold text-gray-700">

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit"
                          className="accent-primary-start"
                          checked={warrantyUnit === 'days'}
                          onChange={() => setWarrantyUnit('days')}
                        />
                        Dias
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit"
                          className="accent-primary-start"
                          checked={warrantyUnit === 'months'}
                          onChange={() => setWarrantyUnit('months')}
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
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />

                  <Input
                    label="CNPJ da Loja"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    className="bg-white border-none"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    inputMode="numeric"
                    maxLength={18}
                  />

                  <Input
                    label="Data da Compra *"
                    type="date"
                    className="bg-white border-none text-gray-400"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0]}
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />

                  <Input
                    label="Valor unitario do produto"
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
                      value={hasExtendedWarranty ? 'sim' : 'nao'}
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
                        label="Meses adicionais (estendida)"
                        type="number"
                        min={0}
                        placeholder="Ex: 12"
                        className="bg-white border-none"
                        value={extendedExtraMonths}
                        onChange={(e) => setExtendedExtraMonths(e.target.value)}
                      />

                      <Input
                        label="Número da Garantia Estendida"
                        type="number"
                        placeholder="Ex: 9928..."
                        className="bg-white border-none"
                        value={extendedWarrantyNumber}
                        onChange={(e) => setExtendedWarrantyNumber(e.target.value)}
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
                    value={nfNumber}
                    onChange={(e) => setNfNumber(e.target.value)}
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
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <WarrantyAttachmentUpload
                    files={files}
                    onChange={setFiles}
                    disabled={isSaving}
                  />
                </>
              )}

              {/* ETAPA 4 - REVISÃO */}
              {step === 4 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col gap-4">

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {productName || 'Produto sem nome'}
                    </h2>

                    <p className="text-sm text-gray-500 italic">
                      {storeName || 'Loja não informada'}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">

                    <p className="text-sm">
                      <span className="font-semibold">Marca:</span> {brand || '—'}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Modelo:</span> {model || '—'}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Quantidade:</span> {quantity || '—'}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Nº da Nota Fiscal:</span> {nfNumber || '—'}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Data da Compra:</span> {purchaseDateDisplay || '—'}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Garantia:</span> {warrantyPeriod} {warrantyUnit === 'months' ? 'meses' : 'dias'}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Tipo:</span> {warrantyTypeLabel}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Vencimento:</span> {expirationDateDisplay || '—'}
                    </p>

                    <p className="text-sm">
                      <span className="font-semibold">Valor:</span> {value || 'R$ 0,00'}
                    </p>

                    {notes && (
                      <div className="mt-2">
                        <p className="font-semibold text-sm">Observações:</p>
                        <p className="text-sm text-gray-600 wrap-break-word">{notes}</p>
                      </div>
                    )}

                    {files.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                        <p className="font-semibold text-sm mb-1 text-gray-700">Notas Fiscais Anexadas:</p>
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg p-3 border border-gray-200">
                            <FileCheck size={20} className="text-green-600 shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium truncate">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BOTÕES */}
              <div className="flex flex-col gap-3 mt-6">

                {step < 4 ? (
                  <ActionButton
                    action="create"
                    variant="primary"
                    label="Continuar"
                    onClick={() => {
                      setStep(step + 1);
                    }}
                  />
                ) : (
                  <ActionButton
                    action="create"
                    variant="primary"
                    label={isSaving ? 'Salvando...' : 'Salvar Garantia'}
                    onClick={() => {
                      void handleSaveWarranty();
                    }}
                  />
                )}

                <ActionButton
                  action="edit"
                  variant="ghost"
                  label={step === 1 ? 'Cancelar' : 'Voltar'}
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