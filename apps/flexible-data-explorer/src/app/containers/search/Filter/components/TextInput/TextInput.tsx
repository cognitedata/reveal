import * as React from 'react';

import { InputControlProps } from '../../types';
import { Input } from '../Input';

export const DEFAULT_TEXT_INPUT_PLACEHOLDER = 'Enter value...';

export interface TextInputProps extends InputControlProps<'string'> {
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder = DEFAULT_TEXT_INPUT_PLACEHOLDER,
  value,
  onChange,
}) => {
  return (
    <Input
      type="text"
      variant="default"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};
