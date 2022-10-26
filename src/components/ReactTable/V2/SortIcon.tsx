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
  let sortLabel = 'Default sorting';
  let sortIcon: IconType = 'ReorderDefault';

  if (isSorted) {
    sortLabel = isSorted === 'desc' ? 'Sort descending' : 'Sort ascending';
    sortIcon = isSorted === 'desc' ? 'ReorderDescending' : 'ReorderAscending';
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
