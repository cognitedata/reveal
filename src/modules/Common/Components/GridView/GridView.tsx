import React from 'react';
import { GridTable } from '@cognite/data-exploration';
import styled from 'styled-components';
import { TableDataItem } from '../../types';

export type GridTableProps<T> = {
  onItemClicked: (item: T) => void;
  data: T[];
  renderCell: (cellProps: any) => JSX.Element;
  tableFooter?: JSX.Element;
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
