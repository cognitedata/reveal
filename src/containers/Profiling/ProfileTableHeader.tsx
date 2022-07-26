import React from 'react';
import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';

import { ZIndexLayer } from 'utils/zIndex';
import { TableCell } from './ProfileRow';
import { SortableColumn } from '.';
import { useTranslation } from 'common/i18n';

type Props = {
  sortKey: SortableColumn;
  setSortKey: (sortKey: SortableColumn) => void;
  sortReversed: boolean;
  setSortReversed: (sortReversed: boolean) => void;
};

export default function ProfileTableHeader(props: Props): JSX.Element {
  const { t } = useTranslation();
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
          {t('profiling-table-header-column')}
          <Icon type="ReorderDefault" onClick={() => onSortClick('label')} />
        </TableCell>
        <TableCell>
          {t('profiling-table-header-empty')}
          <Icon
            type="ReorderDefault"
            onClick={() => onSortClick('nullCount')}
          />
        </TableCell>
        <TableCell>
          {t('profiling-table-header-distinct')}
          <Icon
            type="ReorderDefault"
            onClick={() => onSortClick('distinctCount')}
          />
        </TableCell>
        <TableCell $width={150}>
          {t('profiling-table-header-frequency')}
        </TableCell>
        <TableCell>
          {t('profiling-table-header-min')}
          <Icon type="ReorderDefault" onClick={() => onSortClick('min')} />
        </TableCell>
        <TableCell>
          {t('profiling-table-header-max')}
          <Icon type="ReorderDefault" onClick={() => onSortClick('max')} />
        </TableCell>
        <TableCell>{t('profiling-table-header-mean')}</TableCell>
        <TableCell $width={68}>
          <StyledExpandTableHeaderIcon type="ChevronDown" />
        </TableCell>
      </tr>
      <StyledTableHeaderBackground />
      <StyledTableHeaderWhiteBorder />
      <StyledTableHeaderGrayBorder />
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

const StyledTableHeaderBackground = styled.tr`
  position: absolute;
  top: -12px;
  background-color: ${Colors.white.hex()};
  width: 100%;
  height: 12px;
`;

const StyledTableHeaderWhiteBorder = styled.tr`
  position: absolute;
  top: 0px;
  width: 100%;
  height: 8px;
  border: 1px solid ${Colors.white.hex()};
  border-bottom-width: 0;
  border-top-width: 0;
`;

const StyledTableHeaderGrayBorder = styled.tr`
  position: absolute;
  top: 0px;
  width: 100%;
  height: 8px;
  border: 1px solid ${Colors['border-default'].hex()};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom-width: 0;
`;
