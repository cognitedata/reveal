import { useCallback, useMemo } from 'react';
import { ColumnShape } from 'react-base-table';
import isUndefined from 'lodash/isUndefined';

import { RawDBRow } from '@cognite/sdk';
import isBoolean from 'lodash/isBoolean';
import isObject from 'lodash/isObject';

import { useActiveTableContext } from 'contexts';
import { useTableRows } from 'hooks/sdk-queries';
import { useColumnType } from 'hooks/profiling-service';
import { ALL_FILTER } from 'hooks/table-filters';

export const PRIMARY_KEY_DATAKEY = 'COGNITE_CDF_RAW_EXPLORER_PRIMARY_KEY';
export const LAST_UPDATED_DATAKEY = 'COGNITE_CDF_RAW_EXPLORER_LAST_UPDATED';

const COLUMNS_IGNORE = [LAST_UPDATED_DATAKEY];
const COLUMN_NAMES_MAPPED: Record<string, string> = {
  [PRIMARY_KEY_DATAKEY]: 'Key',
};
const INDEX_COLUMN: ColumnType = {
  key: 'column-index',
  dataKey: 'column-index',
  title: '',
  width: 50,
  flexShrink: 0,
  frozen: 'left',
};
const PAGE_SIZE = 100;

export interface ColumnType extends Partial<ColumnShape> {
  key: string;
  dataKey: string;
  title: string;
}

export const useTableData = () => {
  const { database, table, columnNameFilter, columnTypeFilters } =
    useActiveTableContext();
  const { getColumnType, isFetched } = useColumnType(database, table);

  const chooseRenderType = useCallback((value: any): string => {
    if (isBoolean(value)) return value.toString();
    if (isObject(value)) {
      return Array.isArray(value)
        ? `List: ${value.map((v) => (isObject(v) ? chooseRenderType(v) : v))}`
        : JSON.stringify(value);
    }
    return value;
  }, []);

  const rows = useTableRows({
    database,
    table,
    pageSize: PAGE_SIZE,
  });

  const rawRows: Partial<
    RawDBRow & { [PRIMARY_KEY_DATAKEY]: any; [LAST_UPDATED_DATAKEY]: any }
  >[] = useMemo(() => {
    if (rows.data) {
      return rows.data.pages
        .reduce((accl, page) => [...accl, ...page.items], [] as RawDBRow[])
        .map((row) => {
          const { columns, key: _key, lastUpdatedTime: _lastUpdatedTime } = row;
          return {
            [PRIMARY_KEY_DATAKEY]: _key,
            [LAST_UPDATED_DATAKEY]: _lastUpdatedTime,
            ...columns,
          };
        });
    }
    return [];
  }, [rows.data]);

  const tableLastUpdatedTime =
    rawRows.length > 0 ? new Date(rawRows[0][LAST_UPDATED_DATAKEY]) : undefined;

  const getColumns = (): ColumnType[] => {
    const columnNames = rawRows[0] ? Object.keys(rawRows[0]) : [];
    const otherColumns: ColumnType[] = columnNames
      .filter((name) => !COLUMNS_IGNORE.includes(name))
      .map((name) => ({
        key: name,
        dataKey: name,
        title: COLUMN_NAMES_MAPPED[name] ?? name,
        width: 200,
        flexGrow: 1,
        flexShrink: 0,
        resizable: true,
      }));
    return [INDEX_COLUMN, ...otherColumns];
  };
  const columns = useMemo(getColumns, [rawRows]);

  const allRows = useMemo((): Record<string, any>[] => {
    const columnKeys = columns.map((column: ColumnType) => column.dataKey);
    const rows = rawRows.map((rawRow, index: number) => {
      const row: Record<string, any> = {
        id: `row-${index}`,
        parentId: null,
      };
      columnKeys.forEach((key) => {
        if (key === 'column-index') row[key] = index + 1;
        // value can be boolean:false
        else if (!isUndefined(rawRow[key as keyof RawDBRow]))
          row[key] = chooseRenderType(rawRow[key as keyof RawDBRow]);
      });
      return row;
    });
    return rows;
  }, [rawRows, chooseRenderType, columns]);

  const filteredColumns = useMemo(
    () =>
      isFetched
        ? [
            ...columns.slice(0, 1),
            ...columns.slice(1).filter((column) => {
              const columnType = getColumnType(column.dataKey);
              const fitsTypeFilter = columnTypeFilters.includes(ALL_FILTER)
                ? true
                : columnTypeFilters.includes(columnType);
              const fitsTitleFilter = column.title
                .toLowerCase()
                .includes(columnNameFilter.toLowerCase());
              return fitsTitleFilter && fitsTypeFilter;
            }),
          ]
        : columns,
    [columns, columnNameFilter, columnTypeFilters, isFetched, getColumnType]
  );

  return {
    ...rows,
    rows: allRows,
    columns,
    filteredColumns,
    tableLastUpdatedTime,
  };
};

export const useIsTableEmpty = (database: string, table: string) => {
  const { data = { pages: [] }, isFetched } = useTableRows({
    database,
    table,
    pageSize: 1,
  });

  const isEmpty = useMemo(() => {
    return isFetched && !data.pages[0]?.items?.length;
  }, [isFetched, data]);

  return isEmpty;
};
