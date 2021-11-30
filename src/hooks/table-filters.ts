import { FilterType } from 'components/FilterItem';
import { useActiveTableContext } from 'contexts';

export const DEFAULT_FILTER: FilterType = {
  type: 'columns',
  value: 13,
};

export const useFilters = () => {
  const {
    columnTypeFilters,
    setColumnTypeFilters,
    columnNameFilter,
    setColumnNameFilter,
  } = useActiveTableContext();

  const filters = [
    DEFAULT_FILTER,
    ...mockFilters.filter((mockFilter) => mockFilter.value),
  ];

  const setTypeFilter = (type: string) => {
    const selectAllColumns = type === DEFAULT_FILTER.type;
    const selectFirstFilter =
      !selectAllColumns &&
      !columnTypeFilters.includes(type) &&
      columnTypeFilters.includes(DEFAULT_FILTER.type) &&
      columnTypeFilters.length === 1;
    const selectAnotherFilter =
      !selectAllColumns &&
      !columnTypeFilters.includes(type) &&
      !columnTypeFilters.includes(DEFAULT_FILTER.type) &&
      columnTypeFilters.length > 0;
    const deselectFilter =
      !selectAllColumns &&
      columnTypeFilters.includes(type) &&
      columnTypeFilters.length > 1;
    const deselectLastFilter =
      !selectAllColumns &&
      columnTypeFilters.includes(type) &&
      columnTypeFilters.length === 1;

    if (selectAllColumns || deselectLastFilter)
      setColumnTypeFilters([DEFAULT_FILTER.type]);
    if (selectFirstFilter) setColumnTypeFilters([type]);
    if (selectAnotherFilter) setColumnTypeFilters([...columnTypeFilters, type]);
    if (deselectFilter)
      setColumnTypeFilters([
        ...columnTypeFilters.filter((filter: string) => filter !== type),
      ]);
    if (deselectFilter)
      setColumnTypeFilters([
        ...columnTypeFilters.filter((filter: string) => filter !== type),
      ]);
  };

  return {
    filters,
    columnTypeFilters,
    setTypeFilter,
    columnNameFilter,
    setColumnNameFilter,
  };
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
