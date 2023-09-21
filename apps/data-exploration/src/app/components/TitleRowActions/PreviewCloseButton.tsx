import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button, Tooltip } from '@cognite/cogs.js';

import { VIEW_MODE_FIELD, useTranslation } from '@data-exploration-lib/core';

import { useEndJourney, useViewModeToggle } from '../../hooks';

// This is the close button for details overlay
export const PreviewCloseButton = () => {
  const { t } = useTranslation();
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
    <Tooltip content={t('CLOSE_JOURNEY', 'Close journey')}>
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
