import { Button } from '@cognite/cogs.js';
import { useRecoilState } from 'recoil';
import {
  searchFiltersAtom,
  searchSectionNameMap,
  SEARCH_FILTER_CATEGORIES,
} from 'recoil/search/searchFiltersAtom';

import { SearchFiltersWrapper } from './elements';
// import { PeopleSearchSubFilters } from './SearchSubFilters/PeopleSearchSubFilters';
import { RoomSearchSubFilters } from './SearchSubFilters/RoomsSearchSubFilters';

export const SearchFilters = () => {
  const [searchFilter, setSearchFilter] = useRecoilState(searchFiltersAtom);
  const filters = Object.values(SEARCH_FILTER_CATEGORIES);

  return (
    <>
      <SearchFiltersWrapper>
        {filters.map((filter) => {
          const handleClick = () => {
            setSearchFilter((prevState) => {
              if (prevState === filter) {
                return undefined;
              }
              return filter;
            });
          };
          return (
            <Button
              toggled={searchFilter === filter}
              type="tertiary"
              size="small"
              key={filter}
              onClick={handleClick}
            >
              {searchSectionNameMap[filter]}
            </Button>
          );
        })}
      </SearchFiltersWrapper>
      <SearchFiltersWrapper>
        <RoomSearchSubFilters />
        {/* Add in when more data is available <PeopleSearchSubFilters /> */}
      </SearchFiltersWrapper>
    </>
  );
};
