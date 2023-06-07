import * as React from 'react';

import { Input, InputProps } from '@cognite/cogs.js';

import { SearchInputWrapper } from '../elements';

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  ...rest
}) => {
  return (
    <SearchInputWrapper>
      <Input
        {...rest}
        data-testid="search-input"
        placeholder="Filter by name"
        variant="noBorder"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        autoFocus
      />
    </SearchInputWrapper>
  );
};
