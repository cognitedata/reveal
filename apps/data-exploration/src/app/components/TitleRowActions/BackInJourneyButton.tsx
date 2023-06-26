import React from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { usePopJourney } from '@data-exploration-app/hooks';
import { useTranslation } from '@data-exploration-lib/core';

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
