import { Input } from '@cognite/cogs.js';
import React from 'react';
import debounce from 'lodash/debounce';
import { FilterProps } from '../types';

export const NameFilter: React.FC<FilterProps> = React.memo(({ onChange }) => {
  // const [searchValue, setSearchValue] = React.useState<string>('');

  const doSearch = React.useCallback(
    debounce((value: string) => {
      onChange({ searchQuery: value });
    }, 300),
    []
  );

  return (
    <Input
      icon="Search"
      placeholder="Search"
      onChange={(event) => {
        const { value } = event.target;
        doSearch(value);
      }}
    />
  );
});
