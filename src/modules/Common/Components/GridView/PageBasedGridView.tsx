import React from 'react';
import { FileGridTableProps } from '../FileTable/types';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { GridView } from './GridView';

export const PageBasedGridView = (props: FileGridTableProps) => {
  const { onItemClicked, renderCell, selectedIds } = props;
  return (
    <SorterPaginationWrapper
      data={props.data}
      totalCount={props.totalCount}
      pagination={props.pagination ?? true}
      sortPaginateControls={props.sortPaginateControls}
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
