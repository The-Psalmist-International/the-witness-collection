import { ChevronPair } from "@/app/components/ChevronPair";

type StyledSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type StyledSelectProps = {
  id: string;
  name: string;
  options: StyledSelectOption[];
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  "aria-label"?: string;
};

export function StyledSelect({
  id,
  name,
  options,
  required = false,
  defaultValue = "",
  placeholder,
  "aria-label": ariaLabel,
}: StyledSelectProps) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        aria-label={ariaLabel}
        className="h-10 w-full cursor-pointer appearance-none rounded-md border border-neutral-200 bg-white py-0 pl-3 pr-10 text-sm font-medium text-black outline-none transition-colors hover:border-neutral-300 focus:border-purple-950"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronPair />
    </div>
  );
}
