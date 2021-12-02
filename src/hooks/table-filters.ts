import { useActiveTableContext } from 'contexts';
import { useColumnType } from 'hooks/profiling-service';

import { FilterType } from 'components/FilterItem';

export const ALL_FILTER: 'All' = 'All';
export const DEFAULT_FILTER: FilterType = {
  type: ALL_FILTER,
  value: 0,
};

export const filtersMap: FilterType[] = [
  { type: ALL_FILTER, label: 'columns' },
  { type: 'Number', icon: 'NumberIcon' },
  { type: 'String', icon: 'StringIcon' },
  { type: 'Boolean', icon: 'BooleanIcon' },
  { type: 'Vector' },
  { type: 'Object' },
];

export const useFilters = () => {
  const {
    columnTypeFilters,
    setColumnTypeFilters,
    columnNameFilter,
    setColumnNameFilter,
  } = useActiveTableContext();
  const { getColumnTypeCounts } = useColumnType();

  const columnTypeCounts = getColumnTypeCounts();

  const filters = filtersMap
    .map((filter: FilterType) => ({
      ...filter,
      value: columnTypeCounts[filter.type],
    }))
    .filter((filter: FilterType) => filter.value);

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
