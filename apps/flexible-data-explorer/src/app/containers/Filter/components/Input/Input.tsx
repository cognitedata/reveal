import * as React from 'react';

import { Input as CogsInput, Dropdown, InputVariant } from '@cognite/cogs.js';

import { Suggestion } from '../../types';

import { InputWrapper } from './elements';
import { SuggestionsMenu } from './SuggestionsMenu';

export interface InputProps {
  type?: 'text' | 'number';
  variant?: InputVariant;
  placeholder?: string;
  value?: string | number;
  suggestions?: Suggestion[];
  isSuggestionsLoading?: boolean;
  helpText?: string;
  onChange: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  value = '',
  onChange,
  suggestions = [],
  isSuggestionsLoading,
  ...rest
}) => {
  return (
    <InputWrapper>
      <Dropdown
        appendTo="parent"
        hideOnSelect
        content={
          <SuggestionsMenu
            suggestions={suggestions}
            onSelectSuggestion={onChange}
          />
        }
      >
        <CogsInput
          {...rest}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          icon={isSuggestionsLoading && 'Loader'}
          iconPlacement="right"
        />
      </Dropdown>
    </InputWrapper>
  );
};
