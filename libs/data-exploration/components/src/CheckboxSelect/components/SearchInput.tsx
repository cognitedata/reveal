import * as React from 'react';

import { Input } from '@cognite/cogs.js';

import { SearchInputWrapper } from '../elements';

export interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <SearchInputWrapper>
      <Input
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
