import React, { useCallback, useEffect, useState } from 'react';

import { Input } from '@cognite/cogs.js';

import { DEFAULT_PLACEHOLDER, DEAFUTL_VARIANT } from './constants';
import { SearchBoxWrapper } from './elements';
import { SearchBoxProps } from './types';

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = DEFAULT_PLACEHOLDER,
  value = '',
  variant = DEAFUTL_VARIANT,
}) => {
  const [searchPhrase, setSearchPhrase] = useState<string>(value);

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchPhrase(event.target.value);
    },
    []
  );

  const handlePressEnter = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onSearch(searchPhrase);
      }
    },
    [searchPhrase, onSearch]
  );

  const handleOnBlur = useCallback(() => setSearchPhrase(value), [value]);

  useEffect(() => {
    setSearchPhrase(value);
  }, [value]);

  return (
    <SearchBoxWrapper>
      <Input
        data-testid="search-box-input"
        fullWidth
        variant={variant}
        icon="Search"
        placeholder={placeholder}
        value={searchPhrase}
        onChange={handleOnChange}
        onKeyDown={handlePressEnter}
        onBlur={handleOnBlur}
      />
    </SearchBoxWrapper>
  );
};
