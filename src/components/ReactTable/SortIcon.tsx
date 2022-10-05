import React from 'react';
import { IconType, Button, Tooltip } from '@cognite/cogs.js';
import { HeaderGroup } from 'react-table';
import styled from 'styled-components';

export const SortIcon = ({
  canSort,
  isSorted,
  isSortedDesc,
}: Pick<HeaderGroup, 'canSort' | 'isSorted' | 'isSortedDesc'>) => {
  if (!canSort) {
    return null;
  }
  let sortLabel = 'Sorting';
  let sortIcon: IconType = 'ReorderDefault';
  if (isSorted) {
    sortLabel = isSortedDesc ? 'Descending' : 'Ascending';
    sortIcon = isSortedDesc ? 'ReorderDescending' : 'ReorderAscending';
  }
  return (
    <Tooltip content={sortLabel} arrow={false}>
      <StyledIconButton icon={sortIcon} aria-label={sortLabel} type="ghost" />
    </Tooltip>
  );
};

const StyledIconButton = styled(Button)`
  background-color: transparent;
  padding: 6px;
  &:hover {
    background-color: transparent;
  }
`;
