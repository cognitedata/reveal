import { Skeleton } from '@cognite/cogs.js';
import {
  useEquipmentLocationQuery,
  useGetSearchDataQuery,
} from 'graphql/generated';
import React, { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { searchQueryAtom } from 'recoil/search/searchQueryAtom';
import { getArrayOfItems } from 'utils/search';
import { List } from 'components/List';
import { SearchFilters } from 'components/SearchBar/SearchFilters/SearchFilters';
import { SearchModal } from 'components/SearchModal';
import { searchFiltersAtom } from 'recoil/search/searchFiltersAtom';
import { searchItemsAtom } from 'recoil/search/searchItemsAtom';

import { SearchBar } from '../SearchBar/SearchBar';

import { MarginTopSmall } from './elements';

interface Props {
  autoFocus?: boolean;
  placeholder: string;
}

export const SearchBarAndList: React.FC<Props> = ({
  autoFocus,
  placeholder,
}) => {
  const searchQuery = useRecoilValue(searchQueryAtom);
  const searchFilter = useRecoilValue(searchFiltersAtom);
  const setSearchItems = useSetRecoilState(searchItemsAtom);
  const { data, isLoading } = useGetSearchDataQuery();
  const { data: equipmentData, isLoading: equipmentIsLoading } =
    useEquipmentLocationQuery();

  useEffect(() => {
    const itemsArray = getArrayOfItems(
      data || {},
      equipmentData || {},
      searchFilter
    );
    setSearchItems(itemsArray);
  }, [data, searchFilter]);

  if (isLoading || equipmentIsLoading) return <Skeleton.Text />;

  if (searchFilter !== undefined) {
    return <SearchModal isOpen={searchFilter !== undefined} />;
  }

  return (
    <>
      <div>
        <SearchBar autoFocus={autoFocus} placeholder={placeholder} fullWidth />
      </div>
      <MarginTopSmall>
        {searchQuery === '' ? (
          <SearchFilters />
        ) : (
          <List dropdownStyle onClick={() => null} />
        )}
      </MarginTopSmall>
    </>
  );
};
