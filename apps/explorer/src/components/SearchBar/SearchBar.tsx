import React from 'react';
import { useRecoilState } from 'recoil';
import { searchQueryAtom } from 'recoil/search/searchQueryAtom';

import { SearchInput } from './elements';

interface Props {
  autoFocus?: boolean;
  placeholder: string;
  fullWidth?: boolean;
}

export const SearchBar: React.FC<Props> = ({
  autoFocus,
  placeholder,
  fullWidth,
}) => {
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryAtom);
  const handleOnClear = () => {
    setSearchQuery('');
  };

  return (
    <SearchInput
      icon="Search"
      fullWidth={fullWidth}
      onChange={(e) => setSearchQuery(e.target.value)}
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={searchQuery}
      clearable={{
        callback: handleOnClear,
      }}
    />
  );
};
