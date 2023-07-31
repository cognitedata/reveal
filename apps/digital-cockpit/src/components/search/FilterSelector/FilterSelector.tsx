import { Button, Dropdown, Input, Menu } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { Calendar } from 'react-date-range';

import { SearchFilter, SearchFilterSelector } from '../types';
import { getDefaultFilter } from '../utils';

import { FilterSelectorWrapper } from './elements';

export type FilterSelectorProps = {
  selectors: SearchFilterSelector[];
  filters: SearchFilter[];
  onFiltersChange: (next: SearchFilter[]) => void;
};

const FilterSelector = ({
  selectors,
  filters,
  onFiltersChange,
}: FilterSelectorProps) => {
  // Decides what kind of value changer to render (input field, date selector, etc)
  const renderFilterValueChanger = (
    filter: SearchFilter,
    onChange: (nextFilter: SearchFilter) => void
  ) => {
    if (filter.type === 'STRING') {
      return (
        <Input
          key="selector-value"
          value={filter.value}
          onChange={(e) => {
            onChange({ ...filter, value: e.target.value });
          }}
        />
      );
    }
    if (filter.type === 'BOOLEAN') {
      return (
        <Button
          type={filter.value === 'true' ? 'primary' : 'secondary'}
          key="selector-value"
          onClick={() => {
            onChange({
              ...filter,
              value: filter.value === 'true' ? 'false' : 'true',
            });
          }}
        >
          {filter.value === 'true' ? 'True' : 'False'}
        </Button>
      );
    }
    if (filter.type === 'DATE') {
      return (
        <Dropdown
          content={
            <Calendar
              date={filter.value ? new Date(filter.value) : new Date()}
              onChange={(nextDate) => onChange({ ...filter, value: +nextDate })}
            />
          }
        >
          <Button>
            {filter.value ? dayjs(filter.value).format('LL') : 'Select a date'}
          </Button>
        </Dropdown>
      );
    }
    return null;
  };

  // Renders the constant surroundings of the filter change
  const renderFilter = (
    filter: SearchFilter,
    onChange: (nextFilter: SearchFilter) => void
  ) => {
    return (
      <div key={filter.name} className="filter-selector">
        <Dropdown
          content={
            <Menu>
              {selectors.map((selector) => (
                <Menu.Item
                  key={selector.name}
                  onClick={() => {
                    onChange({ ...filter, ...selector });
                  }}
                >
                  {selector.name}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button
            className="selector-type"
            iconPlacement="right"
            icon="ChevronDown"
          >
            {filter.name}
          </Button>
        </Dropdown>
        <div className="selector-divider">is</div>
        {renderFilterValueChanger(filter, onChange)}
        <Button
          key="selector-delete"
          icon="Delete"
          type="ghost"
          onClick={() => {
            const nextFilters = filters.filter((f) => f.name !== filter.name);
            onFiltersChange(nextFilters);
          }}
        />
      </div>
    );
  };

  return (
    <FilterSelectorWrapper>
      {filters.map((filter, i) =>
        renderFilter(filter, (nextFilter) => {
          const nextFilters = [...filters];
          nextFilters[i] = nextFilter;
          onFiltersChange(nextFilters);
        })
      )}
      <Button
        className="add-filter-btn"
        type="ghost"
        block
        icon="Add"
        onClick={() => {
          onFiltersChange([...filters, getDefaultFilter(selectors[0])]);
        }}
      >
        Add filter
      </Button>
    </FilterSelectorWrapper>
  );
};

export default FilterSelector;
