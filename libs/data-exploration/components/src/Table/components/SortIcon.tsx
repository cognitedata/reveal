import React from 'react';

import { IconType, Button, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

export const SortIcon = ({
  canSort,
  isSorted,
  onClick,
}: {
  canSort: boolean;
  isSorted: false | 'asc' | 'desc';
  onClick: () => void;
}) => {
  const { t } = useTranslation();

  if (!canSort) {
    return null;
  }

  let sortLabel = t('DEFAULT_ORDER', 'Default order');
  let sortIcon: IconType = 'ReorderDefault';

  if (isSorted) {
    sortLabel =
      isSorted === 'desc'
        ? t('DESCENDING_ORDER', 'Descending order')
        : t('ASCENDING_ORDER', 'Ascending order');
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
