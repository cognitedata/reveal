import React from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { usePopJourney } from '../../hooks';

export const BackInJourneyButton = () => {
  const { t } = useTranslation();
  const [, popJourney] = usePopJourney();

  return (
    <Tooltip content={t('BACK_IN_JOURNEY', 'Back in journey')}>
      <Button
        icon="ArrowLeft"
        aria-label="Back in journey"
        onClick={() => {
          popJourney();
        }}
      />
    </Tooltip>
  );
};
