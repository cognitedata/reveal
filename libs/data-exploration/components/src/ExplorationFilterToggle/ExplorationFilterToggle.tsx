import React from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

interface Props {
  filterState: boolean;
  onClick: () => void;
}
export const ExplorationFilterToggle: React.FC<Props> = React.memo(
  ({ filterState, onClick }) => {
    const { t } = useTranslation();
    const icon = filterState ? 'PanelLeft' : 'PanelRight';
    const tooltipContent = filterState
      ? t('HIDE_FILTERS', 'Hide filters')
      : t('SHOW_FILTERS', 'Show filters');

    return (
      <Tooltip position="bottom" content={tooltipContent}>
        <Button
          icon={icon}
          aria-label="Toggle search filters"
          onClick={onClick}
        />
      </Tooltip>
    );
  }
);
