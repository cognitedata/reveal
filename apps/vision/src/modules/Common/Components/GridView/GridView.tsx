import React from 'react';

import styled from 'styled-components';

import { GridTable } from '@data-exploration-components/components';

import { TableDataItem } from '../../types';
import { GridViewProps } from '../FileTable/types';

/**
 * Grid table Wrapper
 * Grid table doesn't need selected id's since the gridTable doesn't transfer that to grid items. The onSelect callback
 * will be passed to grid items if provided
 * In order to stop rerender of all grid items when they are clicked/selected,
 * GridView rerender needs to be stopped every time grid item is clicked/selected using Memoization
 */
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
