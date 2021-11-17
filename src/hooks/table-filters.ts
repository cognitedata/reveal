import { useState } from 'react';
import { FilterType } from 'components/FilterItem';

export const useFilters = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filters = [
    DEFAULT_FILTER,
    ...mockFilters.filter((mockFilter) => mockFilter.value),
  ];

  const setFilter = (type: string) => {
    if (type === DEFAULT_FILTER.type) {
      setActiveFilters([DEFAULT_FILTER.type]);
      return;
    } else {
      // if filter is selected:
      // // add that filter to array
      // // remove columns filter
      // if filter is deselected:
      // // if that's the only selected filter:
      // // // select columns filter
      // // if it's not the only one:
      // // // just deselect
    }
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
