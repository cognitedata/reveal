import { useMemo } from 'react';

import { useActiveTableContext } from 'contexts';
import { useColumnTypeCounts, useColumnType } from 'hooks/profiling-service';

import { FilterType } from 'components/FilterItem';

export const ALL_FILTER: 'All' = 'All';
export const DEFAULT_FILTER: FilterType = {
  type: ALL_FILTER,
  value: 0,
};

export const filtersMap: FilterType[] = [
  { type: ALL_FILTER, label: 'columns' },
  { type: 'Number', icon: 'Number' },
  { type: 'String', icon: 'String' },
  { type: 'Boolean', icon: 'Boolean' },
];

export const useFilters = () => {
  const {
    database,
    table,
    columnTypeFilters,
    setColumnTypeFilters,
    columnNameFilter,
    setColumnNameFilter,
  } = useActiveTableContext();
  const { getColumnTypeCounts } = useColumnTypeCounts(database, table);

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

export const useFilteredColumns = (columns: any) => {
  const { database, table, columnNameFilter, columnTypeFilters } =
    useActiveTableContext();
  const { isFetched: areTypesFetched } = useColumnType(database, table);

  const filteredColumns = useMemo(
    () =>
      areTypesFetched
        ? columns.filter((column: any) => {
            const fitsTypeFilter = columnTypeFilters.includes(ALL_FILTER)
              ? true
              : columnTypeFilters.includes(column.type);
            const fitsTitleFilter = column.label
              .toLowerCase()
              .includes(columnNameFilter.toLowerCase());
            return fitsTitleFilter && fitsTypeFilter;
          })
        : columns,
    [columns, columnNameFilter, columnTypeFilters, areTypesFetched]
  );

  return filteredColumns;
};
