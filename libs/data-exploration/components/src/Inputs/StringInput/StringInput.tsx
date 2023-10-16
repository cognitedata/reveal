import { Input } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { FilterLabel } from '../../Labels/FilterLabel';

export interface StringInputProps {
  label?: string;
  placeholder?: string;
  value?: string | undefined;
  onChange?: (newValue: string | undefined) => void;
  error?: boolean | string;
  loading?: boolean;
}

export const StringInput = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  loading,
}: StringInputProps) => {
  const { t } = useTranslation();

  const handleOnChange = (newValue: string | undefined) => {
    onChange?.(newValue && newValue.length > 0 ? newValue : undefined);
  };

  const isLoading = loading
    ? { disabled: true, icon: 'Loader', placeholder: 'Loading...' }
    : {};
  return (
    <div data-testid={`filter-${label}`}>
      {label && <FilterLabel>{label}</FilterLabel>}
      <Input
        error={error}
        fullWidth
        variant="noBorder"
        value={value || ''}
        placeholder={
          placeholder || t('STARTS_WITH_PLACEHOLDER', 'Starts with...')
        }
        onChange={(event) => {
          handleOnChange(event.target.value);
        }}
        {...isLoading}
      />
    </div>
  );
};
