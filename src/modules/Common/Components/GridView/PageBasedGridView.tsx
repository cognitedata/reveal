import React from 'react';
import { FileGridTableProps } from 'src/modules/Common/Components/FileTable/types';
import { LoadingGrid } from 'src/modules/Common/Components/LoadingRenderer/LoadingGrid';
import { NoData } from 'src/modules/Common/Components/NoData/NoData';
import { TableDataItem } from 'src/modules/Common/types';
import { GridView } from './GridView';

export const PageBasedGridView = (props: FileGridTableProps<TableDataItem>) => {
  const { onItemClicked, renderCell, selectedIds } = props;

  const overlayRenderer = () => (props.isLoading ? <LoadingGrid /> : <></>);
  const emptyRenderer = () => (props.isLoading ? <></> : <NoData />);

  return (
    <GridView
      {...props}
      onItemClick={(item: any) => onItemClicked(item)}
      renderCell={({ item, ...cellProps }: any) => {
        const selected = selectedIds.includes(item.id);
        return renderCell({ item, ...cellProps, selected });
      }}
      isLoading={props.isLoading}
      overlayRenderer={overlayRenderer}
      emptyRenderer={emptyRenderer}
    />
  );
};
