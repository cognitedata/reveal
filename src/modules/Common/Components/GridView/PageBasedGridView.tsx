import React from 'react';
import { AnnotationLoader } from 'src/modules/Common/Components/AnnotationLoader/AnnotationLoader';
import { FileGridTableProps } from 'src/modules/Common/Components/FileTable/types';
import { SorterPaginationWrapper } from 'src/modules/Common/Components/SorterPaginationWrapper/SorterPaginationWrapper';
import { LoadingGrid } from 'src/modules/Common/Components/LoadingRenderer/LoadingGrid';
import { NoData } from 'src/modules/Common/Components/NoData/NoData';
import { GridView } from './GridView';

export const PageBasedGridView = (props: FileGridTableProps) => {
  const { onItemClicked, renderCell, selectedIds } = props;

  const overlayRenderer = () => (props.isLoading ? <LoadingGrid /> : <></>);
  const emptyRenderer = () => (props.isLoading ? <></> : <NoData />);

  return (
    <SorterPaginationWrapper
      data={props.data}
      totalCount={props.totalCount}
      pagination={props.pagination ?? true}
      sortPaginateControls={props.sortPaginateControls}
      isLoading={props.isLoading}
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
            isLoading={props.isLoading}
            overlayRenderer={overlayRenderer}
            emptyRenderer={emptyRenderer}
          />
        </AnnotationLoader>
      )}
    </SorterPaginationWrapper>
  );
};
