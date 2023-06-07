import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useEndJourney, useViewModeToggle } from '@data-exploration-app/hooks';
import { VIEW_MODE_FIELD } from '@data-exploration-lib/core';

// This is the close button for details overlay
export const PreviewCloseButtonV2 = () => {
  const [searchParams] = useSearchParams();
  const [endJourney] = useEndJourney();
  const [viewModeToggle, setViewModeToggle] = useViewModeToggle();

  React.useEffect(() => {
    setViewModeToggle(searchParams.has(VIEW_MODE_FIELD));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get(VIEW_MODE_FIELD)]);

  // Do not show preview close button when in fullpage.
  if (viewModeToggle) {
    return null;
  }

  return (
    <Tooltip content="Close journey">
      <Button
        icon="Close"
        aria-label="Close"
        onClick={() => {
          endJourney();
        }}
      />
    </Tooltip>
  );
};
