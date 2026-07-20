import type { SelectOption } from "../../types/common.types";

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function SelectField({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;