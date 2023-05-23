import * as React from 'react';

import { Input } from '../Input';

export const DEFAULT_SEARCH_INPUT_PLACEHOLDER = 'Filter by name...';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = DEFAULT_SEARCH_INPUT_PLACEHOLDER,
  value,
  onChange,
}) => {
  return (
    <Input
      type="text"
      variant="noBorder"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};
