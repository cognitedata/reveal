import React, { useCallback, useMemo } from 'react';

import { TableDataItem } from '../../types';
import { FileGridTableProps } from '../FileTable/types';
import { LoadingGrid } from '../LoadingRenderer/LoadingGrid';
import { NoData } from '../NoData/NoData';

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
