import React from 'react';
import { TableDataItem } from '../../types';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { GridTableProps, GridView } from './GridView';

export const PageBasedGridView = (
  props: {
    totalCount: number;
    pagination?: boolean;
  } & GridTableProps<TableDataItem>
) => {
  const { onItemClicked, renderCell, selectedIds } = props;
  return (
    <SorterPaginationWrapper
      data={props.data}
      totalCount={props.totalCount}
      pagination={props.pagination ?? true}
    >
      {(paginationProps) => (
        <GridView
          {...props}
          {...paginationProps}
          onItemClicked={(item: any) => onItemClicked(item)}
          renderCell={({ item, ...cellProps }: any) => {
            const selected = selectedIds.includes(item.id);
            return renderCell({ item, ...cellProps, selected });
          }}
        />
      )}
    </SorterPaginationWrapper>
  );
};
