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
  const { onItemClicked, renderCell } = props;
  return (
    <SorterPaginationWrapper
      data={props.data}
      totalCount={props.totalCount}
      pagination={props.pagination ?? true}
    >
      <GridView
        {...props}
        onItemClicked={(item: any) => onItemClicked(item)}
        renderCell={(cellProps: any) => renderCell(cellProps)}
      />
    </SorterPaginationWrapper>
  );
};
