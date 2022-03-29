import React from 'react';

import { useFilterBarIsOpen } from 'modules/sidebar/selectors';

import { SearchMenuContainer } from './elements';
import { SavedSearches } from './SavedSearches';
import { GlobalSearch } from './SearchSaved/GlobalSearch';

export const SearchMenu: React.FC = () => {
  const isOpen = useFilterBarIsOpen();

  if (!isOpen) {
    return null;
  }

  return (
    <SearchMenuContainer>
      <GlobalSearch />
      <SavedSearches />
    </SearchMenuContainer>
  );
};
