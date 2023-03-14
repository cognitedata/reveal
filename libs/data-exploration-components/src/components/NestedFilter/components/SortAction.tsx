import * as React from 'react';

import { Chip } from '@cognite/cogs.js';

import { SortActionWrapper } from '../elements';
import { SortDirection } from '../types';
import { getSortActionData } from '../utils/getSortActionData';
import { getNextSortDirection } from '../utils/getNextSortDirection';

export interface SortActionProps {
  isVisible?: boolean;
  onChange: (sortDirection: SortDirection) => void;
}

export const SortAction: React.FC<SortActionProps> = ({
  isVisible = true,
  onChange,
}) => {
  const [sortDirection, setSortMethod] = React.useState<SortDirection>();

  const { icon, text } = getSortActionData(sortDirection);

  const handleToggleSortMethod = () => {
    const nextSortMethod = getNextSortDirection(sortDirection);

    setSortMethod(nextSortMethod);
    onChange(nextSortMethod);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <SortActionWrapper>
      <Chip
        data-testid="sort-action"
        icon={icon}
        label={`Sort ${text}`}
        iconPlacement="right"
        onClick={handleToggleSortMethod}
      />
    </SortActionWrapper>
  );
};
