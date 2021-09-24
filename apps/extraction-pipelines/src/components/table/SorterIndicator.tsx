import React, { AriaAttributes } from 'react';
import { ColumnInstance } from 'react-table';
import { Button, Icon } from '@cognite/cogs.js';
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
const StyledDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;
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
  const yes = true;
  return yes ? (
    <ButtonWithNoPadding
      type="ghost"
      icon={icon}
      iconPlacement="right"
      aria-sort={ariaSort}
      onClick={onClickSort}
    >
      {name}
    </ButtonWithNoPadding>
  ) : (
    <StyledDiv aria-sort={ariaSort} onClick={onClickSort}>
      <span>{name}</span>
      <Icon type={icon} />
    </StyledDiv>
  );
};

export default SorterIndicator;
