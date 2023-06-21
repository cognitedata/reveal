import React, { useCallback, useMemo } from 'react';
import { FileGridTableProps } from 'src/modules/Common/Components/FileTable/types';
import { LoadingGrid } from 'src/modules/Common/Components/LoadingRenderer/LoadingGrid';
import { NoData } from 'src/modules/Common/Components/NoData/NoData';
import { TableDataItem } from 'src/modules/Common/types';
import { GridView } from './GridView';

export const PageBasedGridView = (props: FileGridTableProps<TableDataItem>) => {
  const overlayRenderer = useCallback(
    () => (props.isLoading ? <LoadingGrid /> : <></>),
    [props.isLoading]
  );
  const emptyRenderer = useCallback(
    () => (props.isLoading ? <></> : <NoData />),
    [props.isLoading]
  );

  const gridView = useMemo(
    () => (
      <GridView
        {...props}
        overlayRenderer={overlayRenderer}
        emptyRenderer={emptyRenderer}
      />
    ),
    [
      props.isLoading,
      props.data,
      props.onItemClick,
      props.renderCell,
      props.tableFooter,
      overlayRenderer,
      emptyRenderer,
    ]
  );

  return <>{gridView}</>;
};
