import React from 'react';
import { GridTable } from '@cognite/data-exploration';
import styled from 'styled-components';
import { PaginationProps } from 'src/modules/Common/Components/FileTable/types';
import { TableDataItem } from '../../types';

export type GridTableProps<T> = Pick<
  PaginationProps<TableDataItem>,
  'data' | 'tableFooter'
> & {
  onItemClicked: (item: T) => void;
  renderCell: (cellProps: any) => JSX.Element;
};

export const GridView = (props: GridTableProps<TableDataItem>) => {
  return (
    <>
      <GridWrapper>
        <GridTable {...props} />
      </GridWrapper>
      {props.tableFooter}
    </>
  );
};

const GridWrapper = styled.div`
  width: 100%;
  height: 100%;
`;
