import React from 'react';
import { GridTable } from '@cognite/data-exploration';
import { TableDataItem } from 'src/modules/Common/types';
import styled from 'styled-components';
import { GridViewProps } from 'src/modules/Common/Components/FileTable/types';

export const GridView = (props: GridViewProps<TableDataItem>) => {
  const { overlayRenderer, emptyRenderer, ...gridTableProps } = props;
  const loading = gridTableProps.isLoading;
  const noData = gridTableProps.data.length <= 0;

  if (loading) return overlayRenderer();
  if (noData) return emptyRenderer();
  return (
    <>
      <GridWrapper>
        <GridTable {...gridTableProps} />
      </GridWrapper>
      {props.tableFooter}
    </>
  );
};

const GridWrapper = styled.div`
  width: 100%;
  height: 100%;
`;
