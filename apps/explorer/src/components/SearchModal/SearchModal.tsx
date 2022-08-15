import { List } from 'components/List';
import { SearchBar } from 'components/SearchBar';
import React from 'react';
import { createPortal } from 'react-dom';
import { useSetRecoilState } from 'recoil';
import { searchFiltersAtom } from 'recoil/search/searchFiltersAtom';

import { SearchFilters } from '../SearchBar/SearchFilters/SearchFilters';

import { SearchModalWrapper } from './elements';

interface Props {
  isOpen: boolean;
}

const ReactPortal: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return createPortal(children, document.getElementById('modal-root')!);
};

export const SearchModal: React.FC<React.PropsWithChildren<Props>> = ({
  isOpen,
}) => {
  const setSearchFilters = useSetRecoilState(searchFiltersAtom);

  if (!isOpen) return null;

  return (
    <ReactPortal>
      <SearchModalWrapper>
        <SearchBar placeholder="What are you looking for?" fullWidth />
        <SearchFilters />
        <List onClick={() => setSearchFilters(undefined)} />
      </SearchModalWrapper>
    </ReactPortal>
  );
};
