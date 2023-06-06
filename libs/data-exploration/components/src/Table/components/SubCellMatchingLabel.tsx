import styled from 'styled-components';

import { Cell, Column } from '@tanstack/react-table';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';

import { MatchingLabels } from '@data-exploration-lib/domain-layer';

import { MatchingLabelsComponent } from './MatchingLabels';

export const SubCellMatchingLabels = <
  T extends {
    matchingLabels?: MatchingLabels;
  }
>(
  cell: Cell<T, unknown>
) => {
  // INFO: if no column order is set get the first column from config
  const firstColumn = getFirstVisibleColumn(
    cell.getContext().table.getVisibleLeafColumns(),
    cell.getContext().table.getState().columnOrder
  );

  const row = cell.row;
  const key = cell.column.id;

  if (isEmpty(row.original.matchingLabels)) {
    return null;
  }

  if (key !== firstColumn) {
    return null;
  }

  return (
    <LabelMatcherWrapper
      key={`matching-label-${row.id}`}
      style={{
        marginLeft: has(cell.column.columnDef?.meta, 'isExpandable')
          ? `${row.depth * 2}rem`
          : 'initial',
      }}
    >
      {row.original.matchingLabels && (
        <MatchingLabelsComponent
          exact={row.original.matchingLabels.exact}
          partial={row.original.matchingLabels.partial}
          fuzzy={row.original.matchingLabels.fuzzy}
        />
      )}
    </LabelMatcherWrapper>
  );
};

const getFirstVisibleColumn = <T,>(
  visibleColumns: Column<T, unknown>[],
  columnOrder: string[]
) => {
  const visibleColumnIds = visibleColumns.map((col) => col.id);

  if (columnOrder.length === 0) {
    return visibleColumnIds[0] === 'select'
      ? visibleColumnIds[1]
      : visibleColumnIds[0];
  }
  return columnOrder.find((column) => visibleColumnIds.includes(column));
};
const LabelMatcherWrapper = styled.div`
  display: flex;
  margin-top: 4px;
`;
