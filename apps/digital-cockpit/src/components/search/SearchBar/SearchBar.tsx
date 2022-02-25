import { Button, Dropdown, Input, Tag } from '@cognite/cogs.js';
import dayjs from 'dayjs';

import FilterSelector from '../FilterSelector';
import {
  InternalFilterSettings,
  SearchFilter,
  SearchFilterSelector,
} from '../types';
import { getDefaultFilter } from '../utils';

import { SearchBarWrapper } from './elements';

export type SearchBarProps = {
  value: InternalFilterSettings;
  onChange: (nextValue: InternalFilterSettings) => void;
  selectors: SearchFilterSelector[];
};

const SearchBar = ({ value, onChange, selectors }: SearchBarProps) => {
  const { query, filters } = value;
  const setFilters = (nextFilters: SearchFilter[]) =>
    onChange({ ...value, filters: nextFilters });

  const renderFilterValue = (filter: SearchFilter) => {
    if (filter.type === 'DATE') {
      return dayjs(filter.value).format('LL');
    }
    return filter.value;
  };

  const renderFilters = () => {
    if (!filters) return null;
    return (
      <div className="filters">
        {filters.map((filter) => (
          <Tag
            style={{ marginRight: 8 }}
            key={filter.name}
            closable
            onClose={() => {
              setFilters(filters.filter((f) => f.name !== filter.name));
            }}
          >
            {filter.name}: {renderFilterValue(filter)}
          </Tag>
        ))}
      </div>
    );
  };

  const handleFilterClick = () => {
    if (filters.length === 0) {
      setFilters([getDefaultFilter(selectors[0])]);
    }
  };

  return (
    <SearchBarWrapper>
      <div className="input">
        <Input
          className="search-input"
          placeholder="Search"
          icon="Search"
          value={query}
          onChange={(e) => {
            onChange({ ...value, query: e.target.value });
          }}
          postfix={
            <Dropdown
              content={
                <FilterSelector
                  selectors={selectors}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              }
            >
              <Button
                type={filters.length === 0 ? 'ghost' : 'link'}
                icon="Filter"
                onClick={handleFilterClick}
              />
            </Dropdown>
          }
        />
      </div>
      {renderFilters()}
    </SearchBarWrapper>
  );
};

export default SearchBar;
