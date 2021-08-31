import React from 'react';
import { AnnotationLoader } from '../AnnotationLoader/AnnotationLoader';
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
        <AnnotationLoader data={paginationProps.data}>
          <GridView
            {...props}
            {...paginationProps}
            onItemClicked={(item: any) => onItemClicked(item)}
            renderCell={({ item, ...cellProps }: any) => {
              const selected = selectedIds.includes(item.id);
              return renderCell({ item, ...cellProps, selected });
            }}
          />
        </AnnotationLoader>
      )}
    </SorterPaginationWrapper>
  );
};
