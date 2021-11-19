import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnShape } from 'react-base-table';
import { RawDBRow } from '@cognite/sdk';
import isBoolean from 'lodash/isBoolean';
import isObject from 'lodash/isObject';
import { useActiveTable } from 'hooks/table-tabs';
import { useTableRows } from 'hooks/sdk-queries';

const COLUMN_NAMES_MAPPED: Record<string, string> = {
  key: 'Key',
  lastUpdatedTime: 'Last update time',
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

interface ColumnType extends Partial<ColumnShape> {
  key: string;
  dataKey: string;
  title: string;
}

export const useTableData = () => {
  const [[database, table] = []] = useActiveTable();
  const [tableFilters, setTableFilters] = useState([]);

  const enabled = !!database && !!table;

  const chooseRenderType = useCallback((value: any): string => {
    if (isBoolean(value)) return value.toString();
    if (isObject(value)) {
      return Array.isArray(value)
        ? `List: ${value.map((v) => (isObject(v) ? chooseRenderType(v) : v))}`
        : JSON.stringify(value);
    }
    return value;
  }, []);

  const rows = useTableRows(
    {
      database: database!,
      table: table!,
      pageSize: PAGE_SIZE,
    },
    { enabled }
  );

  useEffect(() => {
    if (rows.isFetched && enabled) rows.refetch();
  }, [rows.isFetched, enabled, rows.refetch]);

  const rawRows: Partial<RawDBRow>[] = useMemo(() => {
    if (rows.data) {
      return rows.data.pages
        .reduce((accl, page) => [...accl, ...page.items], [] as RawDBRow[])
        .map((row) => {
          const { columns, ...rest } = row;
          return {
            ...rest,
            ...columns,
          };
        });
    }
    return [];
  }, [rows.data]);

  const getColumns = (): ColumnType[] => {
    const columnNames = rawRows[0] ? Object.keys(rawRows[0]) : [];
    const otherColumns: ColumnType[] = columnNames.map((name) => ({
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

  const getRows = (): Record<string, any>[] => {
    const columnKeys = columns.map((column: ColumnType) => column.dataKey);
    const rows = rawRows.map((rawRow, index: number) => {
      const row: Record<string, any> = {
        id: `row-${index}`,
        parentId: null,
      };
      columnKeys.forEach((key) => {
        if (key === 'column-index') row[key] = index + 1;
        else if (key === 'lastUpdatedTime' && rawRow.lastUpdatedTime)
          row.lastUpdatedTime = new Date(
            rawRow.lastUpdatedTime
          ).toLocaleString();
        else if (rawRow[key as keyof RawDBRow])
          row[key] = chooseRenderType(rawRow[key as keyof RawDBRow]);
      });
      return row;
    });
    return rows;
  };
  const allRows = useMemo(getRows, [rawRows]);

  return {
    ...rows,
    rows: allRows,
    columns,
    tableFilters,
    setTableFilters,
  };
};
