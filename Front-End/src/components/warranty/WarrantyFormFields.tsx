import Input from "../ui/Input";
import { formatCnpj } from "../../utils/cnpj";
import {
  WARRANTY_TYPE_OPTIONS,
  type WarrantyFormValues,
} from "../../utils/warrantyForm";

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
  return (
    <div className="space-y-4">
      <Input
        label="Produto *"
        value={values.title}
        onChange={(e) => onChange("title", e.target.value)}
        disabled={disabled}
        error={errors.title}
        placeholder="Ex.: Geladeira Electrolux"
      />

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
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data da compra"
          value={values.purchaseDate}
          onChange={(e) => onChange("purchaseDate", e.target.value)}
          disabled={disabled}
          error={errors.purchaseDate}
          placeholder="DD/MM/AAAA"
        />
        <Input
          label="Vencimento"
          value={values.expirationDate}
          onChange={(e) => onChange("expirationDate", e.target.value)}
          disabled={disabled}
          error={errors.expirationDate}
          placeholder="DD/MM/AAAA"
        />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-semibold text-gray-700 ml-1">
          Tipo de garantia
        </label>
        <select
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

      <Input
        label="Valor"
        value={values.value}
        onChange={(e) => onChange("value", e.target.value)}
        disabled={disabled}
        error={errors.value}
        placeholder="Ex.: R$ 1.000,00"
      />

      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-semibold text-gray-700 ml-1">
          Observações
        </label>
        <textarea
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
