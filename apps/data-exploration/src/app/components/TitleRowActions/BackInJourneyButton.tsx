import React from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { usePopJourney } from '@data-exploration-app/hooks';

export const BackInJourneyButton = () => {
  const [, popJourney] = usePopJourney();

  return (
    <Tooltip content="Back in journey">
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
