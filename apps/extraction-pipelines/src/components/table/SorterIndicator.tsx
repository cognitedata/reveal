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
          icon: 'SortDescending',
          ariaSort: 'descending',
        }
      : {
          icon: 'SortAscending',
          ariaSort: 'ascending',
        };
  }
  return {
    icon: 'ReorderDefault',
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

  display: flex;
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
