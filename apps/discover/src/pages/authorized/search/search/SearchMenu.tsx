import React from 'react';

import { useFilterBarIsOpen } from 'modules/sidebar/selectors';

import { SearchMenuContainer } from './elements';
import { SavedSearches } from './SavedSearches';
import { SearchHistory } from './SearchSaved/SearchHistory';

export const SearchMenu: React.FC = () => {
  const isOpen = useFilterBarIsOpen();

  if (!isOpen) {
    return null;
  }

  return (
    <SearchMenuContainer>
      <SearchHistory />
      <SavedSearches />
    </SearchMenuContainer>
  );
};
