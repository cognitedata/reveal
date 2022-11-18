import React from 'react';
import { IconType, Button, Tooltip } from '@cognite/cogs.js';

export const SortIcon = ({
  canSort,
  isSorted,
  onClick,
}: {
  canSort: boolean;
  isSorted: false | 'asc' | 'desc';
  onClick: () => void;
}) => {
  if (!canSort) {
    return null;
  }
  let sortLabel = 'Default order';
  let sortIcon: IconType = 'ReorderDefault';

  if (isSorted) {
    sortLabel = isSorted === 'desc' ? 'Descending order' : 'Ascending order';
    sortIcon = isSorted === 'desc' ? 'ReorderAscending' : 'ReorderDescending';
  }
  return (
    <Tooltip content={sortLabel} arrow={false}>
      <Button
        icon={sortIcon}
        aria-label={sortLabel}
        type="ghost"
        onClick={onClick}
      />
    </Tooltip>
  );
};
