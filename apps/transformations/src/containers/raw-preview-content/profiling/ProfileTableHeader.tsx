import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import { ZIndexLayer } from '@transformations/utils/zIndex';

import { Button, Colors, Flex, IconType } from '@cognite/cogs.js';

import { SortableColumn } from '.';
import { TableCell, TableCellProps } from './ProfileRow';

type Props = {
  sortKey: SortableColumn;
  setSortKey: (sortKey: SortableColumn) => void;
  sortReversed: boolean;
  setSortReversed: (sortReversed: boolean) => void;
};

type TableHeaderSortState = 'asc' | 'desc' | undefined;

type TableHeaderCellProps = Omit<TableCellProps, 'children'> & {
  children?: React.ReactNode;
  onSortClick?: () => void;
  sortState?: TableHeaderSortState;
};

const TableHeaderCell = ({
  children,
  onSortClick,
  sortState,
  ...otherProps
}: TableHeaderCellProps) => {
  let icon: IconType;
  if (!sortState) {
    icon = 'ReorderDefault';
  } else if (sortState === 'asc') {
    icon = 'ReorderAscending';
  } else {
    icon = 'ReorderDescending';
  }

  return (
    <TableCell {...otherProps}>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ width: '100%' }}
      >
        {children}
        {onSortClick && (
          <Button
            icon={icon}
            onClick={onSortClick}
            size="small"
            toggled={!!sortState}
            type="ghost"
          />
        )}
      </Flex>
    </TableCell>
  );
};

export default function ProfileTableHeader(props: Props): JSX.Element {
  const { t } = useTranslation();
  const { sortKey, setSortKey, sortReversed, setSortReversed } = props;
  const onSortClick = (key: SortableColumn) => {
    const reverse = sortKey === key;
    setSortKey(key);
    if (reverse) setSortReversed(!sortReversed);
  };

  const getSortState = (columnKey: string): TableHeaderSortState => {
    if (sortKey !== columnKey) {
      return undefined;
    }

    return sortReversed ? 'desc' : 'asc';
  };

  return (
    <StyledTableHeader>
      <tr>
        <TableHeaderCell
          width={44}
          onSortClick={() => onSortClick('type')}
          sortState={getSortState('type')}
        />
        <TableHeaderCell
          onSortClick={() => onSortClick('label')}
          sortState={getSortState('label')}
        >
          {t('column')}
        </TableHeaderCell>
        <TableHeaderCell
          onSortClick={() => onSortClick('nullCount')}
          sortState={getSortState('nullCount')}
        >
          {t('empty')}
        </TableHeaderCell>
        <TableHeaderCell
          onSortClick={() => onSortClick('distinctCount')}
          sortState={getSortState('distinctCount')}
        >
          {t('distinct')}
        </TableHeaderCell>
        <TableHeaderCell width={150}>{t('frequency')}</TableHeaderCell>
        <TableHeaderCell
          onSortClick={() => onSortClick('min')}
          sortState={getSortState('min')}
        >
          {t('min')}
        </TableHeaderCell>
        <TableHeaderCell
          onSortClick={() => onSortClick('max')}
          sortState={getSortState('max')}
        >
          {t('max')}
        </TableHeaderCell>
        <TableHeaderCell>{t('mean')}</TableHeaderCell>
        <TableHeaderCell width={48} />
      </tr>
    </StyledTableHeader>
  );
}

const StyledTableHeader = styled.thead`
  position: sticky;
  top: 0;
  background-color: ${Colors['surface--muted']};
  background-color: white;
  background-color: ${Colors['surface--muted']};
  background-color: white;
  border-radius: 0;
  color: ${Colors['decorative--grayscale--700']};
  z-index: ${ZIndexLayer.Dropdown}; /** lower values causes histograms to render above the scrolled header **/

  .styled-cell {
    border: none;
    padding: 0;
  }

  .styled-cell-content {
    background-color: ${Colors['surface--medium']};
    border: 1px solid ${Colors['border--interactive--default']};
    border-right: none;
    height: 41px;
  }

  .styled-cell:first-child .styled-cell-content {
    border-radius: 4px 0 0 0;
  }

  .styled-cell:last-child .styled-cell-content {
    border-radius: 0 4px 0 0;
    border-right: 1px solid ${Colors['border--interactive--default']};
  }

  tr {
    border-radius: 0;
  }

  td .cogs-icon {
    cursor: pointer;
  }
`;
