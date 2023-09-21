import { Button, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { useViewModeToggle } from '../../hooks';

export const FullscreenButton = () => {
  const { t } = useTranslation();
  const [viewModeToggle, setViewModeToggle] = useViewModeToggle();

  return (
    <Tooltip
      content={
        !viewModeToggle
          ? t('OPEN_FULL_SCREEN', 'Open in full screen')
          : t('CLOSE_FULL_SCREEN', 'Close full screen')
      }
    >
      {viewModeToggle ? (
        <Button
          icon="Collapse"
          aria-label="Toggle fullscreen-collapse"
          onClick={() => {
            setViewModeToggle(!viewModeToggle);
          }}
        >
          {t('MINIMIZE', 'Minimize')}
        </Button>
      ) : (
        <Button
          icon="Expand"
          aria-label="Toggle fullscreen-expand"
          onClick={() => {
            setViewModeToggle(!viewModeToggle);
          }}
        />
      )}
    </Tooltip>
  );
};
