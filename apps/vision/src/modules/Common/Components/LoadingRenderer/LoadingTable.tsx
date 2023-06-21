import React from 'react';

import styled from 'styled-components';

import { DEFAULT_PAGE_SIZE } from '@vision/constants/PaginationConsts';
import { GradientAnimateRow } from '@vision/modules/Common/Components/LoadingRenderer/GradientAnimateRow';
import {
  SelectableTableColumnShape,
  TableDataItem,
} from '@vision/modules/Common/types';
import { generateKeysArray } from '@vision/utils/generateKeysArray';

import { Checkbox } from '@cognite/cogs.js';

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
