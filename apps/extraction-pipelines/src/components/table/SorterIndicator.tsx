import React, { AriaAttributes } from 'react';
import { ColumnInstance } from 'react-table';
import { Button } from '@cognite/cogs.js';
import { AllIconTypes } from '@cognite/cogs.js/dist/Atoms/Icon';
import { trackUsage } from 'utils/Metrics';
import { SORT } from 'utils/constants';
import styled from 'styled-components';

const getSortOrder = <T extends object>(
  column: ColumnInstance<T>
): { icon: AllIconTypes; ariaSort: AriaAttributes['aria-sort'] } => {
  if (column.isSorted) {
    return column.isSortedDesc
      ? {
          icon: 'SortDown',
          ariaSort: 'descending',
        }
      : {
          icon: 'SortUp',
          ariaSort: 'ascending',
        };
  }
  return {
    icon: 'SortBoth',
    ariaSort: 'none',
  };
};
interface SorterIndicatorProps<T extends object> {
  column: ColumnInstance<T>;
  name: string;
}
const ButtonWithNoPadding = styled(Button)`
  && {
    padding: 0;
  }
  display: block;
  color: inherit;
`;
const SorterIndicator = <T extends object>({
  column,
  name,
}: SorterIndicatorProps<T>) => {
  const { icon, ariaSort } = getSortOrder(column);
  const onClickSort = () => {
    trackUsage(SORT, { field: name });
  };
  return (
    <ButtonWithNoPadding
      type="ghost"
      icon={icon}
      iconPlacement="right"
      aria-sort={ariaSort}
      onClick={onClickSort}
    >
      {name}
    </ButtonWithNoPadding>
  );
};

export default SorterIndicator;
