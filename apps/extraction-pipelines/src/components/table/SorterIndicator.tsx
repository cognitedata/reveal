import React from 'react';
import { ColumnInstance } from 'react-table';
import { NoStyleBtn } from '../../styles/StyledButton';

function getSortOrder<T extends object>(column: ColumnInstance<T>) {
  if (column.isSorted) {
    if (column.isSortedDesc) {
      return {
        icon: 'SortDown',
        ariaSort: 'descending',
      };
    }
    return {
      icon: 'SortUp',
      ariaSort: 'ascending',
    };
  }
  return {
    icon: 'OrderDesc',
    ariaSort: 'none',
  };
}
interface SorterIndicatorProps<T extends object> {
  column: ColumnInstance<T>;
  name: string;
}
const SorterIndicator = <T extends object>({
  column,
  name,
}: SorterIndicatorProps<T>) => {
  const { icon, ariaSort } = getSortOrder(column);
  return (
    <NoStyleBtn icon={icon} iconPlacement="right" aria-sort={ariaSort}>
      {name}
    </NoStyleBtn>
  );
};

export default SorterIndicator;
