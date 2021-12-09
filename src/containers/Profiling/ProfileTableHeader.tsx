import React from 'react';
import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';

import { ZIndexLayer } from 'utils/zIndex';
import { TableCell } from './ProfileRow';
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
        <TableCell $width={44}>
          <Icon type="ReorderDefault" onClick={() => onSortClick('type')} />
        </TableCell>
        <TableCell>
          Column
          <Icon type="ReorderDefault" onClick={() => onSortClick('label')} />
        </TableCell>
        <TableCell>
          Empty
          <Icon
            type="ReorderDefault"
            onClick={() => onSortClick('nullCount')}
          />
        </TableCell>
        <TableCell>
          Distinct
          <Icon
            type="ReorderDefault"
            onClick={() => onSortClick('distinctCount')}
          />
        </TableCell>
        <TableCell $width={150}>Frequency</TableCell>
        <TableCell>
          Min
          <Icon type="ReorderDefault" onClick={() => onSortClick('min')} />
        </TableCell>
        <TableCell>
          Max
          <Icon type="ReorderDefault" onClick={() => onSortClick('max')} />
        </TableCell>
        <TableCell>Mean</TableCell>
        <TableCell $width={68}>
          <StyledExpandTableHeaderIcon type="ChevronDown" />
        </TableCell>
      </tr>
    </StyledTableHeader>
  );
}

const StyledTableHeader = styled.thead`
  position: sticky;
  top: 12px;
  background-color: ${Colors['greyscale-grey1'].hex()};
  color: ${Colors['greyscale-grey7'].hex()};
  z-index: ${ZIndexLayer.Dropdown}; /** lower values causes histograms to render above the scrolled header **/
  .styled-cell {
    border-top: 1px solid ${Colors['greyscale-grey4'].hex()};
    border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
    border-left: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
  .styled-cell:first-child {
    border-radius: 8px 0 0 0;
  }
  .styled-cell:last-child {
    border-right: 1px solid ${Colors['greyscale-grey4'].hex()};
    border-radius: 0 8px 0 0;
  }
  td .cogs-icon {
    cursor: pointer;
  }
`;

const StyledExpandTableHeaderIcon = styled(Icon)`
  cursor: pointer;
  margin: 0 10px;
`;
