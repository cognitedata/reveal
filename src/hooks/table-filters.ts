import { useState } from 'react';
import { FilterType } from 'components/FilterItem';

export const useFilters = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([
    DEFAULT_FILTER.type,
  ]);

  const filters = [
    DEFAULT_FILTER,
    ...mockFilters.filter((mockFilter) => mockFilter.value),
  ];

  const setFilter = (type: string) => {
    const selectAllColumns = type === DEFAULT_FILTER.type;
    const selectFirstFilter =
      !selectAllColumns &&
      !activeFilters.includes(type) &&
      activeFilters.includes(DEFAULT_FILTER.type) &&
      activeFilters.length === 1;
    const selectAnotherFilter =
      !selectAllColumns &&
      !activeFilters.includes(type) &&
      !activeFilters.includes(DEFAULT_FILTER.type) &&
      activeFilters.length > 0;
    const deselectFilter =
      !selectAllColumns &&
      activeFilters.includes(type) &&
      activeFilters.length > 1;
    const deselectLastFilter =
      !selectAllColumns &&
      activeFilters.includes(type) &&
      activeFilters.length === 1;

    if (selectAllColumns || deselectLastFilter)
      setActiveFilters([DEFAULT_FILTER.type]);
    if (selectFirstFilter) setActiveFilters([type]);
    if (selectAnotherFilter) setActiveFilters([...activeFilters, type]);
    if (deselectFilter)
      setActiveFilters([...activeFilters.filter((active) => active !== type)]);
    if (deselectFilter)
      setActiveFilters([...activeFilters.filter((active) => active !== type)]);
  };

  return { filters, activeFilters, setFilter };
};

const DEFAULT_FILTER: FilterType = {
  type: 'columns',
  value: 13,
};

// mock
const mockFilters: FilterType[] = [
  {
    type: 'number',
    value: 7,
    icon: 'NumberIcon',
  },
  {
    type: 'string',
    value: 6,
    icon: 'StringIcon',
  },
  {
    type: 'boolean',
    value: 6,
    icon: 'BooleanIcon',
  },
  {
    type: 'vector',
    value: 0,
  },
  {
    type: 'object',
    value: 0,
  },
  {
    type: 'date',
    value: 6,
    icon: 'DateIcon',
  },
];
