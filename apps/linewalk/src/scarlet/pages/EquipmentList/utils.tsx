import { Skeleton } from '@cognite/cogs.js';
import { CellProps } from 'react-table';
import { EquipmentListItem } from 'scarlet/types';

import { ColumnAccessor } from './types';
import * as Styled from './style';

export const getCellValue = ({
  value,
  cell,
}: CellProps<EquipmentListItem, string>) => {
  if (value !== undefined) return value;
  switch (cell.column.id) {
    case ColumnAccessor.TYPE:
      return '—';
    default:
      return '';
  }
};

export const getCellStatus = ({
  value,
}: CellProps<EquipmentListItem, string>) => {
  return (
    <Styled.StatusLabel approved={value === 'Approved'}>
      {value}
    </Styled.StatusLabel>
  );
};

export const getCellSkeleton = ({
  cell,
}: CellProps<EquipmentListItem, string>) => {
  let width = '120px';
  let height = '21px';
  switch (cell.column.id) {
    case ColumnAccessor.ID:
      width = '80px';
      break;

    case ColumnAccessor.STATUS:
      height = '29px';
      break;
  }
  return (
    <Skeleton.Rectangle
      role="row"
      width={width}
      height={height}
      style={{ margin: 0 }}
    />
  );
};
