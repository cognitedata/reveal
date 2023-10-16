import { Input } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

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
  placeholder,
  error,
  loading,
}: NumberInputProps) => {
  const { t } = useTranslation();

  const handleValueChange = (newValue: string | undefined) => {
    const parsedValue = newValue === '' ? undefined : Number(newValue);
    onChange?.(parsedValue);
  };

  const isLoading = loading
    ? { disabled: true, icon: 'Loader', placeholder: 'Loading...' }
    : {};

  return (
    <div data-testid={`filter-${label}`}>
      {label && <FilterLabel>{label}</FilterLabel>}

      <Input
        type="number"
        variant="noBorder"
        error={error}
        fullWidth
        value={value || ''}
        placeholder={
          placeholder ||
          t('ENTER_EXACT_MATCH_PLACEHOLDER', 'Enter exact match...')
        }
        onChange={(event) => {
          handleValueChange(event.target.value);
        }}
        {...isLoading}
      />
    </div>
  );
};
