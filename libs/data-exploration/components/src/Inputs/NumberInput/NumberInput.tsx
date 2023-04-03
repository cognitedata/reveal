import { Input } from '@cognite/cogs.js';
import { FilterLabel } from '../../Labels/FilterLabel';

export interface NumberInputProps {
  label?: string;
  placeholder?: string;
  value?: number | undefined;
  onChange?: (newValue: number | undefined) => void;
  error?: boolean | string;
  loading?: boolean;
}

export const NumberInput = ({
  value,
  onChange,
  label,
  placeholder = 'Enter exact match...',
  error,
  loading,
}: NumberInputProps) => {
  const handleValueChange = (newValue: string | undefined) => {
    const parsedValue = newValue === '' ? undefined : Number(newValue);
    onChange?.(parsedValue);
  };

  const isLoading = loading
    ? { disabled: true, icon: 'Loader', placeholder: 'Loading...' }
    : {};

  return (
    <>
      {label && <FilterLabel>{label}</FilterLabel>}

      <Input
        type="number"
        variant="noBorder"
        error={error}
        fullWidth
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => {
          handleValueChange(event.target.value);
        }}
        {...isLoading}
      />
    </>
  );
};
