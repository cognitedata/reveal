import { RegularHeader } from 'components/Header';
import { List } from 'components/List';
import { NoResults } from 'components/NoResults';
import { SearchBar } from 'components/SearchBar';
import { useGetSearchDataQuery } from 'graphql/generated';
import isEmpty from 'lodash/isEmpty';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getArrayOfItems, getFuseSearch } from 'utils/search';

import { SearchModalWrapper } from './elements';

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

const ReactPortal: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return createPortal(children, document.getElementById('modal-root')!);
};

export const SearchModal: React.FC<React.PropsWithChildren<Props>> = ({
  isOpen,
  handleClose,
}) => {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useGetSearchDataQuery();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(event.target.value);

  const itemsArray = getArrayOfItems(data || {});
  const itemsObj = getFuseSearch(query, itemsArray);

  if (!isOpen || isLoading) return null;

  return (
    <ReactPortal>
      <SearchModalWrapper>
        <RegularHeader>
          <RegularHeader.Left>
            <SearchBar
              icon="ArrowLeft"
              placeholder="What are you looking for?"
              autoFocus
              query={query}
              handleChange={handleChange}
              handleClose={handleClose}
            />
          </RegularHeader.Left>
        </RegularHeader>
        {isEmpty(itemsObj) ? (
          <NoResults />
        ) : (
          <List items={itemsObj} onClick={handleClose} />
        )}
      </SearchModalWrapper>
    </ReactPortal>
  );
};
