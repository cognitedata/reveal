import * as React from 'react';

import { Input as CogsInput, InputVariant } from '@cognite/cogs.js';

import { InputWrapper } from './elements';

export interface InputProps {
  type?: 'text' | 'number';
  variant?: InputVariant;
  placeholder?: string;
  value?: string | number;
  onChange: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({ onChange, ...rest }) => {
  return (
    <InputWrapper>
      <CogsInput {...rest} onChange={(event) => onChange(event.target.value)} />
    </InputWrapper>
  );
};
