import * as React from 'react';

import { useTranslation } from '../../../../hooks/useTranslation';
import { BaseInputProps } from '../../types';
import { Input } from '../Input';

export interface NumberInputProps extends BaseInputProps<number> {
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  placeholder,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation();

  return (
    <Input
      {...rest}
      type="number"
      variant="default"
      placeholder={placeholder ?? t('FILTER_NUMBER_INPUT_PLACEHOLDER')}
      onChange={(inputValue) => {
        const newValue = inputValue.length ? Number(inputValue) : undefined;
        onChange(newValue);
      }}
    />
  );
};
