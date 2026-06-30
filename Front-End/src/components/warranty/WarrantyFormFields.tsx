import Input from "../ui/Input";
import { formatCnpj } from "../../utils/cnpj";
import {
  calculateTotalFromUnit,
  formatCurrencyFromDigits,
  handleCurrencyInputKeyDown,
  handleCurrencyInputPaste,
} from "../../utils/currency";
import {
  WARRANTY_TYPE_OPTIONS,
  type WarrantyFormValues,
} from "../../utils/warrantyForm";
import { computeExpirationDateBR } from "../../utils/warrantyDates";

interface WarrantyFormFieldsProps {
  values: WarrantyFormValues;
  errors: Partial<Record<keyof WarrantyFormValues, string>>;
  disabled?: boolean;
  onChange: <K extends keyof WarrantyFormValues>(
    field: K,
    value: WarrantyFormValues[K]
  ) => void;
}

export default function WarrantyFormFields({
  values,
  errors,
  disabled = false,
  onChange,
}: WarrantyFormFieldsProps) {
  const qty = Number(values.quantity);
  const showTotalValue = qty > 1;
  const totalValueLabel = calculateTotalFromUnit(values.value, values.quantity);
  const isExtendedWarranty = values.warrantyType
    .toLowerCase()
    .includes("estendida");

  function handleUnitValueChange(raw: string): void {
    const digits = raw.replace(/\D/g, "");
    onChange("value", formatCurrencyFromDigits(digits));
  }

  function recalcExpiration(
    purchaseDate: string,
    period: string,
    unit: "days" | "months"
  ): void {
    const periodNum = Number(period);
    if (purchaseDate && periodNum > 0) {
      const exp = computeExpirationDateBR(purchaseDate, periodNum, unit, 0);
      if (exp) onChange("expirationDate", exp);
    }
  }

  function handlePurchaseDateChange(date: string): void {
    onChange("purchaseDate", date);
    recalcExpiration(date, values.warrantyPeriod, values.warrantyUnit);
  }

  function handlePeriodChange(raw: string): void {
    onChange("warrantyPeriod", raw);
    recalcExpiration(values.purchaseDate, raw, values.warrantyUnit);
  }

  function handleUnitChange(unit: "days" | "months"): void {
    onChange("warrantyUnit", unit);
    recalcExpiration(values.purchaseDate, values.warrantyPeriod, unit);
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nome do Produto *"
        value={values.title}
        onChange={(e) => onChange("title", e.target.value)}
        disabled={disabled}
        error={errors.title}
        placeholder="Ex.: Geladeira Electrolux"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Marca"
          value={values.brand}
          onChange={(e) => onChange("brand", e.target.value)}
          disabled={disabled}
          error={errors.brand}
          placeholder="Ex.: Samsung"
        />
        <Input
          label="Modelo"
          value={values.model}
          onChange={(e) => onChange("model", e.target.value)}
          disabled={disabled}
          error={errors.model}
          placeholder="Ex.: Galaxy S21"
        />
      </div>

      <Input
        label="Loja"
        value={values.story}
        onChange={(e) => onChange("story", e.target.value)}
        disabled={disabled}
        error={errors.story}
        placeholder="Ex.: Magazine Luiza"
      />

      <Input
        label="CNPJ da loja"
        value={values.storeCnpj}
        onChange={(e) => onChange("storeCnpj", formatCnpj(e.target.value))}
        disabled={disabled}
        error={errors.storeCnpj}
        placeholder="00.000.000/0000-00"
        inputMode="numeric"
        maxLength={18}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nº da nota fiscal"
          value={values.nfNumber}
          onChange={(e) => onChange("nfNumber", e.target.value)}
          disabled={disabled}
          error={errors.nfNumber}
        />
        <Input
          label="Quantidade"
          value={values.quantity}
          onChange={(e) => onChange("quantity", e.target.value)}
          disabled={disabled}
          error={errors.quantity}
          inputMode="numeric"
        />
      </div>

      <Input
        label="Data da compra"
        value={values.purchaseDate}
        onChange={(e) => handlePurchaseDateChange(e.target.value)}
        disabled={disabled}
        error={errors.purchaseDate}
        placeholder="DD/MM/AAAA"
      />

      <div className="flex gap-4 items-end">
        <Input
          label="Período de Garantia"
          type="number"
          min={0}
          placeholder="Ex.: 12"
          className="flex-1"
          value={values.warrantyPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
          disabled={disabled}
          error={errors.warrantyPeriod}
        />
        <div className="flex gap-2 mb-3 text-xs font-bold text-gray-700">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              className="accent-primary-start"
              checked={values.warrantyUnit === "days"}
              disabled={disabled}
              onChange={() => handleUnitChange("days")}
            />
            Dias
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              className="accent-primary-start"
              checked={values.warrantyUnit === "months"}
              disabled={disabled}
              onChange={() => handleUnitChange("months")}
            />
            Meses
          </label>
        </div>
      </div>

      <Input
        label="Vencimento"
        value={values.expirationDate}
        onChange={(e) => onChange("expirationDate", e.target.value)}
        disabled={disabled}
        error={errors.expirationDate}
        placeholder="DD/MM/AAAA"
      />

      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="warranty-type" className="text-sm font-semibold text-gray-700 ml-1">
          Tipo de garantia
        </label>
        <select
          id="warranty-type"
          name="warrantyType"
          value={values.warrantyType}
          onChange={(e) => onChange("warrantyType", e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 bg-white border border-gray rounded-lg shadow-sm text-gray-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
        >
          {WARRANTY_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {isExtendedWarranty ? (
        <Input
          label="Número da garantia estendida"
          value={values.extendedWarrantyNumber}
          onChange={(e) => onChange("extendedWarrantyNumber", e.target.value)}
          disabled={disabled}
          error={errors.extendedWarrantyNumber}
          placeholder="Ex.: 9928..."
          inputMode="numeric"
        />
      ) : null}

      <Input
        label="Valor unitário do produto"
        type="text"
        inputMode="numeric"
        value={values.value}
        onChange={(e) => handleUnitValueChange(e.target.value)}
        onKeyDown={handleCurrencyInputKeyDown}
        onPaste={(e) =>
          handleCurrencyInputPaste(e, (formatted) => onChange("value", formatted))
        }
        disabled={disabled}
        error={errors.value}
        placeholder="R$ 0,00"
      />

      {showTotalValue && values.quantity ? (
        <div className="bg-purple-50 border border-primary-start rounded-xl p-4">
          <p className="text-sm text-gray-600">Valor total</p>
          <p className="text-xl font-bold text-primary-start">{totalValueLabel}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="warranty-notes" className="text-sm font-semibold text-gray-700 ml-1">
          Observações
        </label>
        <textarea
          id="warranty-notes"
          name="notes"
          value={values.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="Nenhuma observação adicionada"
          className="w-full px-4 py-2 bg-white border border-gray rounded-lg shadow-sm text-gray-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:opacity-60"
        />
      </div>
    </div>
  );
}
