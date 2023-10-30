import { Tooltip } from '@cognite/cogs.js';
import { RevealToolbar } from '@cognite/reveal-react-components';

export const SlicerButton = () => {
  return (
    <Tooltip content="Slicer" position="right">
      <RevealToolbar.SlicerButton />
    </Tooltip>
  );
};
