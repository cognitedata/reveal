import React, { ReactNode, useState } from 'react';

import { Table as AntdTable, TableProps as AntdTableProps } from 'antd';
import { ColumnType, SortOrder } from 'antd/lib/table/interface';

import { Body, TooltipProps } from '@cognite/cogs.js';

import { TableColumnTitle } from './TableColumnTitle';

type TableColumnType<RecordType> = Omit<ColumnType<RecordType>, 'title'> & {
  title: React.ReactNode;
};

export type TableProps<RecordType> = {
  columns: TableColumnType<RecordType>[];
  defaultSort?: [ColumnType<RecordType>['key'], SortOrder];
  emptyContent: ReactNode;
  onSort?: (key: string, direction: SortOrder) => void;
  appendTooltipTo: TooltipProps['appendTo'];
  dataTestId?: string;
} & Omit<AntdTableProps<RecordType>, 'columns'>;

export const Table = <RecordType extends Record<string, unknown>>({
  columns,
  defaultSort,
  onSort,
  emptyContent,
  appendTooltipTo,
  dataTestId,
  ...tableProps
}: TableProps<RecordType>): JSX.Element => {
  const [sortState, setSortState] = useState<
    [ColumnType<RecordType>['key'], SortOrder] | undefined
  >(defaultSort);
  const [sortedKey, sortOrder] = sortState ?? [];

  const getOrderArray = (): SortOrder[] => {
    return ['ascend', 'descend', null];
  };

  const handleSortStateChange = (key: ColumnType<RecordType>['key']) => {
    setSortState((prevSortState) => {
      const [prevKey, prevSortOrder] = prevSortState ?? [];

      const order = getOrderArray();

      const newSortValue: [ColumnType<RecordType>['key'], SortOrder] = [
        key,
        order[0],
      ];

      if (key === prevKey) {
        const currentSortIndex = order.indexOf(prevSortOrder!);
        newSortValue[1] = order[(currentSortIndex + 1) % order.length];
      }

      if (onSort) {
        onSort(...(newSortValue as [string, SortOrder]));
      }

      return newSortValue;
    });
  };

  const getSortOrder = (key?: React.Key) =>
    key === sortedKey ? sortOrder : undefined;

  const extendedColumns = columns?.map(
    ({ render, sorter, title, ...columnProps }) => ({
      ...columnProps,
      sortOrder: getSortOrder(columnProps.key),
      render: (value: any, record: RecordType, index: number) => (
        <Body level={2}>{render ? render(value, record, index) : value}</Body>
      ),
      title: (
        <TableColumnTitle<RecordType>
          _key={columnProps.key}
          onClick={handleSortStateChange}
          sorter={sorter}
          sortOrder={getSortOrder(columnProps.key)}
          title={title}
          appendTo={appendTooltipTo}
        />
      ),
    })
  );

  const getSortFn = sortedKey
    ? columns.find(({ key }) => key === sortedKey)?.sorter
    : undefined;

  const getSortedDataSource = () => {
    const data = [...(tableProps?.dataSource ?? [])];
    if (sortedKey && sortOrder && typeof getSortFn === 'function') {
      if (sortOrder === 'descend') {
        return data?.sort(getSortFn).reverse();
      }
      return data?.sort(getSortFn);
    }
    return tableProps?.dataSource;
  };

  const sortedDataSource = getSortedDataSource();

  return (
    <AntdTable<RecordType>
      columns={extendedColumns}
      locale={{
        emptyText: emptyContent,
      }}
      {...tableProps}
      dataSource={sortedDataSource}
      data-testid={dataTestId}
    />
  );
};
