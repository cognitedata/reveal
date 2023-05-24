import * as React from 'react';

import { Input } from '../Input';
import { InputControlProps } from '../../types';

export const DEFAULT_NUMBER_INPUT_PLACEHOLDER = 'Enter value...';

export interface NumberInputProps extends InputControlProps<'number'> {
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  placeholder = DEFAULT_NUMBER_INPUT_PLACEHOLDER,
  value,
  onChange,
}) => {
  return (
    <Input
      type="number"
      variant="default"
      placeholder={placeholder}
      value={value}
      onChange={(inputValue) => onChange(Number(inputValue))}
    />
  );
};
