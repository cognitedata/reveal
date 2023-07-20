import * as React from 'react';

import { useTranslation } from '../../../../hooks/useTranslation';
import { InputControlProps } from '../../types';
import { Input } from '../Input';

export interface NumberInputProps extends InputControlProps<number> {
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  placeholder,
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <Input
      type="number"
      variant="default"
      placeholder={placeholder ?? t('FILTER_NUMBER_INPUT_PLACEHOLDER')}
      value={value}
      onChange={(inputValue) => {
        const newValue = inputValue.length ? Number(inputValue) : undefined;
        onChange(newValue);
      }}
    />
  );
};
