import { SortOrder } from 'types';

import * as Styled from './style';

type SortOrderButtonProps = {
  sortOrder: SortOrder;
  onChange: (order: SortOrder) => void;
};

export const SortOrderButton = ({
  sortOrder,
  onChange,
}: SortOrderButtonProps) => {
  const isAscending = sortOrder === SortOrder.ASCENDING;
  return (
    <Styled.Button
      type="ghost"
      icon={isAscending ? 'SortAscending' : 'SortDescending'}
      iconPlacement="right"
      size="small"
      onClick={() =>
        onChange(isAscending ? SortOrder.DESCENDING : SortOrder.ASCENDING)
      }
    >
      {isAscending ? 'Ascending' : 'Descending'}
    </Styled.Button>
  );
};
