import React, { AriaAttributes } from 'react';
import { ColumnInstance } from 'react-table';
import { AllIconTypes, Button } from '@cognite/cogs.js';
import styled from 'styled-components';

import { trackUsage } from 'utils/Metrics';

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
    trackUsage({ t: 'Sort', field: name });
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
