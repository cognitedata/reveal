import * as React from 'react';

import { Icon } from '@cognite/cogs.js';

export const TableColumnSortIcons: React.FC<{
  state: boolean | string;
  onClick?: (event: unknown) => void;
}> = ({ state, onClick }) => {
  if (state === 'desc') {
    return (
      <Icon
        type="ReorderAscending"
        aria-label="Sort Ascending"
        onClick={onClick}
      />
    );
  }
  if (state === 'asc') {
    return (
      <Icon
        type="ReorderDescending"
        aria-label="Sort Descending"
        onClick={onClick}
      />
    );
  }

  return (
    <Icon type="ReorderDefault" aria-label="Click to sort" onClick={onClick} />
  );
};
