import { Button, Tooltip } from '@cognite/cogs.js';

import { useViewModeToggle } from '@data-exploration-app/hooks';

// TODO: rename maybe -> FullPageButton
export const FullscreenButtonV2 = () => {
  const [viewModeToggle, setViewModeToggle] = useViewModeToggle();

  return (
    <Tooltip
      content={!viewModeToggle ? 'Open in fullscreen' : 'Close fullscreen'}
    >
      {viewModeToggle ? (
        <Button
          icon="Collapse"
          aria-label="Toggle fullscreen-collapse"
          onClick={() => {
            setViewModeToggle(!viewModeToggle);
          }}
        >
          Minimize
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
