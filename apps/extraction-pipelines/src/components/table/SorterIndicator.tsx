import React, { AriaAttributes } from 'react';
import { ColumnInstance } from 'react-table';
import { Button } from '@cognite/cogs.js';
import { AllIconTypes } from '@cognite/cogs.js/dist/Atoms/Icon';

function getSortOrder<T extends object>(
  column: ColumnInstance<T>
): { icon: AllIconTypes; ariaSort: AriaAttributes['aria-sort'] } {
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
    <Button type="ghost" icon={icon} iconPlacement="right" aria-sort={ariaSort}>
      {name}
    </Button>
  );
};

export default SorterIndicator;
