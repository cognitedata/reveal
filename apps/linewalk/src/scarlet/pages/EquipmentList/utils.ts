import { CellProps } from 'react-table';
import { EquipmentListItem } from 'scarlet/types';

import { ColumnAccessor } from './types';

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
