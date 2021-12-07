import React from 'react';
import styled from 'styled-components';
import { Flex, Colors, Icon } from '@cognite/cogs.js';
import { TableData } from './ProfileRow';

import { SortableColumn } from '.';

type Props = {
  sortKey: SortableColumn;
  setSortKey: (sortKey: SortableColumn) => void;
  sortReversed: boolean;
  setSortReversed: (sortReversed: boolean) => void;
};

export default function ProfileTableHeader(props: Props): JSX.Element {
  const { sortKey, setSortKey, sortReversed, setSortReversed } = props;
  const onSortClick = (key: SortableColumn) => {
    const reverse = sortKey === key;
    setSortKey(key);
    if (reverse) setSortReversed(!sortReversed);
  };
  return (
    <StyledTableHeader>
      <tr>
        <TableData $width={44}>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Icon type="ReorderDefault" onClick={() => onSortClick('type')} />
          </Flex>
        </TableData>
        <TableData>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Column
            <Icon type="ReorderDefault" onClick={() => onSortClick('label')} />
          </Flex>
        </TableData>
        <TableData>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Empty
            <Icon
              type="ReorderDefault"
              onClick={() => onSortClick('nullCount')}
            />
          </Flex>
        </TableData>
        <TableData>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Distinct
            <Icon
              type="ReorderDefault"
              onClick={() => onSortClick('distinctCount')}
            />
          </Flex>
        </TableData>
        <TableData $width={150}>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Frequency
          </Flex>
        </TableData>
        <TableData>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Min
            <Icon type="ReorderDefault" onClick={() => onSortClick('min')} />
          </Flex>
        </TableData>
        <TableData>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Max
            <Icon type="ReorderDefault" onClick={() => onSortClick('max')} />
          </Flex>
        </TableData>
        <TableData>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Mean
          </Flex>
        </TableData>
        <TableData $width={68}>
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <StyledExpandTableHeaderIcon type="ChevronDown" />
          </Flex>
        </TableData>
      </tr>
    </StyledTableHeader>
  );
}

const StyledTableHeader = styled.thead`
  background-color: ${Colors['greyscale-grey1'].hex()};
  color: ${Colors['greyscale-grey7'].hex()};
  td {
    border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
  td .cogs-icon {
    cursor: pointer;
  }
`;

const StyledExpandTableHeaderIcon = styled(Icon)`
  cursor: pointer;
  margin: 0 10px;
`;
