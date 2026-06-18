import { Upload, FileCheck, X } from 'lucide-react';
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import ActionButton from '../components/ui/ActionButton';
import LayoutHome from '../layout/LayoutHome';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hasExtendedWarranty, setHasExtendedWarranty] = useState(false);
  const [value, setValue] = useState('');
  const [step, setStep] = useState(1);

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [warrantyUnit, setWarrantyUnit] = useState<'days' | 'months'>('months');

  const [hasMultipleUnits, setHasMultipleUnits] = useState(false);

  const [storeName, setStoreName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [extendedExtraMonths, setExtendedExtraMonths] = useState('');
  const [extendedWarrantyNumber, setExtendedWarrantyNumber] = useState('');

  const [nfNumber, setNfNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const steps = ['Produto', 'Compra', 'Nota Fiscal', 'Revisão'];

  function formatCurrencyFromDigits(digits: string): string {
    if (!digits) return '';
    const numberValue = Number(digits) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(numberValue);
  }

  function handleValueChange(raw: string): void {
    const digits = raw.replace(/\D/g, '');
    setValue(formatCurrencyFromDigits(digits));
  }

  function handleValueKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(event.key)) return;
    if (event.ctrlKey || event.metaKey) return;
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  function handleValuePaste(
    event: React.ClipboardEvent<HTMLInputElement>
  ): void {
    event.preventDefault();
    const digits = event.clipboardData.getData('text').replace(/\D/g, '');
    setValue(formatCurrencyFromDigits(digits));
  }

  function parseUnitPrice(): number {
    return Number(value.replace(/\D/g, '')) / 100;
  }

  function calculateTotalValue(): string {
    const unitPrice = parseUnitPrice();
    const qty = Number(quantity);

    if (!unitPrice || !hasMultipleUnits || !qty || qty <= 0) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(unitPrice * qty);
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

    let attachments;
    if (file) {
      setIsSaving(true);
      try {
        attachments = [await fileToAttachment(file)];
      } catch (err) {
        setIsSaving(false);
        window.alert(
          err instanceof Error ? err.message : 'Não foi possível processar o arquivo.'
        );
        return;
      }
    } else {
      setIsSaving(true);
    }

    try {
      await addWarranty({
        productName: name,
        brand: brand.trim(),
        model: model.trim(),
        purchaseDate,
        warrantyPeriod: periodNum,
        warrantyUnit,
        hasExtendedWarranty,
        extendedExtraMonths: extraMonths,
        extendedWarrantyNumber: extendedWarrantyNumber.trim() || undefined,
        storeName: storeName.trim() || undefined,
        cnpj: cnpj.trim() || undefined,
        nfNumber: nfNumber.trim() || undefined,
        quantity: quantity.trim() || undefined,
        value: value || undefined,
        notes,
        attachments,
      });
      navigate('/home');
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a garantia.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    void handleSaveWarranty();
  }

  return (
    <LayoutHome
      namePage="Cadastro de Garantia"
      showMenu={false}
      showNotification={false}
      showBack
    >
      <div className="min-h-screen bg-fundo">
        <main className="p-2.5">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg max-w-md mx-auto">

            {/* Título */}
            <h1 className="text-lg font-bold text-gray-dark">
              Cadastro de Garantia
            </h1>

            <p className="text-sm text-gray-dark/80 mb-6 font-medium">
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
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-medium border-gray/50'
                          }
                        `}
                      >
                        {currentStep}
                      </div>

                      <span className="text-xs mt-1 text-center text-gray-dark">
                        {item}
                      </span>
                    </div>

                    {currentStep !== steps.length && (
                      <div
                        className={`
                          h-1 flex-1 mx-2 rounded transition-all
                          ${
                            step > currentStep
                              ? 'bg-primary'
                              : 'bg-gray/50'
                          }
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>

              {/* ETAPA 1 */}
              {step === 1 && (
                <>
                  <Input
                    label="Nome do Produto *"
                    placeholder="Ex: Notebook"
                    className="bg-white border border-gray/50"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />

                  <Input
                    label="Marca *"
                    placeholder="Ex: Lenovo"
                    className="bg-white border border-gray/50"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />

                  <Input
                    label="Modelo *"
                    placeholder="Ex: IdeaPad"
                    className="bg-white border border-gray/50"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                  <input
                    id="has-multiple-units"
                    name="hasMultipleUnits"
                    type="checkbox"
                    checked={hasMultipleUnits}
                    onChange={(e) =>
                      setHasMultipleUnits(e.target.checked)
                    }
                    className="accent-primary w-4 h-4"
                    />

                    <label htmlFor="has-multiple-units" className="text-sm font-medium text-gray-dark">Produto possui mais de uma unidade?</label>
                  </div>
                  {hasMultipleUnits && (
                  <Input
                    label="Quantidade de Produto"
                    type="number"
                    min={0}
                    placeholder="Ex: 2"
                    className="bg-white border border-gray/50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />)}
                  <div className="flex gap-4 items-end">

                    <Input
                      label="Período de Garantia *"
                      type="number"
                      min={0}
                      placeholder="Ex: 12"
                      className="flex-1 bg-white border border-gray/50"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                    />

                    <div className="flex gap-2 mb-3 text-xs font-bold text-gray-dark">

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit"
                          className="accent-primary"
                          checked={warrantyUnit === 'days'}
                          onChange={() => setWarrantyUnit('days')}
                        />
                        Dias
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit"
                          className="accent-primary"
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
                    className="bg-white border border-gray/50"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />

                  <Input
                    label="CNPJ da Loja"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    className="bg-white border border-gray/50"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    inputMode="numeric"
                    maxLength={18}
                  />

                  <Input
                    label="Data da Compra *"
                    type="date"
                    className="bg-white border border-gray/50 text-gray-medium"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0]}
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />

                  <Input
                    label="Valor unitário do produto"
                    type="text"
                    inputMode="numeric"
                    value={value}
                    placeholder="R$ 0,00"
                    onChange={(e) => handleValueChange(e.target.value)}
                    onKeyDown={handleValueKeyDown}
                    onPaste={handleValuePaste}
                    className="bg-white border border-gray/50"
                  />

                  {hasMultipleUnits && quantity && (
                  <div className="bg-primary/5 border border-primary rounded-xl p-4">

                    <p className="text-sm text-gray-dark/80">
                      Valor total
                    </p>

                    <p className="text-xl font-bold text-primary">
                      {calculateTotalValue()}
                    </p>
                  </div>
                )}

                  {/* Garantia Estendida */}
                  <div className="flex flex-col gap-1">

                    <label htmlFor="extended-warranty" className="text-sm font-semibold text-gray-dark ml-1">
                      Garantia Estendida?
                    </label>

                    <select
                      id="extended-warranty"
                      name="extendedWarranty"
                      className="
                        w-full px-4 py-2.5
                        bg-white border border-gray/50 rounded-lg shadow-sm
                        focus:ring-2 focus:ring-primary focus:border-transparent
                        outline-none text-gray-dark
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
                        className="bg-white border border-gray/50"
                        value={extendedExtraMonths}
                        onChange={(e) => setExtendedExtraMonths(e.target.value)}
                      />

                      <Input
                        label="Número da Garantia Estendida"
                        type="text"
                        placeholder="Ex: 9928..."
                        className="bg-white border border-gray/50"
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
                    className="bg-white border border-gray/50"
                    value={nfNumber}
                    onChange={(e) => setNfNumber(e.target.value)}
                  />

                  {/* Observações */}
                  <div className="flex flex-col gap-1">

                    <label htmlFor="warranty-notes" className="text-sm font-semibold text-gray-dark ml-1">
                      Observações
                    </label>

                    <textarea
                      id="warranty-notes"
                      name="notes"
                      className="
                        w-full px-4 py-2
                        bg-white border border-gray/50 rounded-lg
                        h-24
                        focus:ring-2 focus:ring-primary focus:border-transparent
                        outline-none shadow-sm
                      "
                      placeholder="Informações adicionais..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Upload */}
                  <div className="flex flex-col gap-1">

                    <label htmlFor="nf-file" className="text-sm font-semibold text-gray-dark ml-1">
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
                            ? 'border-green bg-green/10'
                            : 'border-gray-medium hover:border-primary hover:bg-gray'
                        }
                      `}
                    >
                      <input
                        id="nf-file"
                        name="nfFile"
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
                              className="text-green"
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
                              p-1 hover:bg-red/10 rounded-full
                              text-red transition-colors cursor-pointer
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
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray/50 flex flex-col gap-4">

              <div>
                <h2 className="text-xl font-bold text-gray-dark">
                  {productName || 'Produto sem nome'}
                </h2>

                <p className="text-sm text-gray-medium italic">
                  {storeName || 'Loja não informada'}
                </p>
              </div>

              <div className="border-t border-gray/50 pt-4 flex flex-col gap-2">

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Marca:
                  </span>{' '}
                  {brand || '—'}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Modelo:
                  </span>{' '}
                  {model || '—'}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Quantidade:
                  </span>{' '}
                  {quantity || '—'}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Nº da Nota Fiscal:
                  </span>{' '}
                  {nfNumber || '—'}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Data da Compra:
                  </span>{' '}
                  {purchaseDateDisplay || '—'}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Garantia:
                  </span>{' '}
                  {warrantyPeriod} {warrantyUnit === 'months' ? 'meses' : 'dias'}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Tipo:
                  </span>{' '}
                  {warrantyTypeLabel}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Vencimento:
                  </span>{' '}
                  {expirationDateDisplay || '—'}
                </p>

                <p className="text-sm text-gray-dark">
                  <span className="font-semibold">
                    Valor unitário:
                  </span>{' '}
                  {value || 'R$ 0,00'}
                </p>

                {hasMultipleUnits && Number(quantity) > 0 ? (
                  <p className="text-sm text-gray-dark">
                    <span className="font-semibold">
                      Valor total:
                    </span>{' '}
                    {calculateTotalValue()}
                  </p>
                ) : null}

                {notes && (
                  <div className="mt-2">
                    <p className="font-semibold text-sm text-gray-dark">
                      Observações:
                    </p>

                    <p className="text-sm text-gray-dark/80 wrap-break-word">
                      {notes}
                    </p>
                  </div>
                )}

                {file && (
                  <div className="mt-2 flex items-center gap-2 bg-gray rounded-lg p-3">
                    <FileCheck
                      size={20}
                      className="text-green"
                    />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-dark">
                        {file.name}
                      </span>

                      <span className="text-xs text-gray-medium">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
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
                    type="submit"
                    label="Continuar"
                  />
                ) : (
                  <ActionButton
                    action="create"
                    variant="primary"
                    type="submit"
                    label={isSaving ? 'Salvando...' : 'Salvar Garantia'}
                  />
                )}

                <ActionButton
                  action="edit"
                  variant="ghost"
                  type="button"
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