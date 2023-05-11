import * as React from 'react';

import { Input } from '../Input';

export const DEFAULT_NUMBER_INPUT_PLACEHOLDER = 'Enter value...';

export interface NumberInputProps {
  placeholder?: string;
  value?: number;
  onChange: (value: number) => void;
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
