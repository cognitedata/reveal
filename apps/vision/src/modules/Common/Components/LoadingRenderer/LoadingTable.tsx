import React from 'react';

import styled from 'styled-components';

import { Checkbox } from '@cognite/cogs.js';

import { DEFAULT_PAGE_SIZE } from '../../../../constants/PaginationConsts';
import { generateKeysArray } from '../../../../utils/generateKeysArray';
import { SelectableTableColumnShape, TableDataItem } from '../../types';

import { GradientAnimateRow } from './GradientAnimateRow';

export const LoadingTable = ({
  columns,
}: {
  columns: SelectableTableColumnShape<TableDataItem>[];
}) => {
  const columnWidths = columns.map((column) => column.width);
  const rowKeys = generateKeysArray(DEFAULT_PAGE_SIZE);
  const columnKeys = generateKeysArray(columns.length);

  return (
    <Container>
      <Header />
      {rowKeys.map((key) => (
        <Row key={key}>
          <GradientAnimateRow width={100}>
            <Checkbox
              name="Checkbox"
              disabled
              style={{ paddingLeft: '7.5px' }}
            />
          </GradientAnimateRow>
          {columnWidths.map((width, index) => (
            <GradientAnimateRow width={width} key={columnKeys[index]} />
          ))}
        </Row>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  height: -webkit-fill-available;
`;
const Header = styled.div`
  height: 49px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background: #ffffff;
`;
