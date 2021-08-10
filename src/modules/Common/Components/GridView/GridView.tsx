import React from 'react';
import { GridTable } from '@cognite/data-exploration';
import styled from 'styled-components';
import { GridViewProps } from 'src/modules/Common/Components/FileTable/types';
import { TableDataItem } from '../../types';

export const GridView = (props: GridViewProps<TableDataItem>) => {
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
