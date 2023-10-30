import { Button, Tooltip } from '@cognite/cogs.js';

import {
  toggleWireframesVisibility,
  useContextualizeThreeDViewerStore,
} from '../../../../useContextualizeThreeDViewerStore';

export const ToggleWireframeVisibilityButton = () => {
  const { isWireframesVisible } = useContextualizeThreeDViewerStore(
    (state) => ({
      isWireframesVisible: state.isWireframesVisible,
    })
  );

  return (
    <Tooltip content="Toggle wireframe visibility" position="right">
      <Button
        icon="Cube"
        aria-label="Toggle wireframe visibility"
        type="ghost"
        toggled={isWireframesVisible}
        onClick={toggleWireframesVisibility}
      />
    </Tooltip>
  );
};
