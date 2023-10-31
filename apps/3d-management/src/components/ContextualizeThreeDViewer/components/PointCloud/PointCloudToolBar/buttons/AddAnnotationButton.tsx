import { Button, Tooltip } from '@cognite/cogs.js';

import {
  ToolType,
  setTool,
  useContextualizeThreeDViewerStore,
} from '../../../../useContextualizeThreeDViewerStore';
import ToolTooltip from '../../../ToolTooltip';

export const AddAnnotationButton = () => {
  const { tool } = useContextualizeThreeDViewerStore((state) => ({
    tool: state.tool,
  }));

  return (
    <Tooltip
      content={<ToolTooltip label="Create" keys={['B']} />}
      position="right"
    >
      <Button
        icon="AddLarge"
        type="ghost"
        aria-label="Add annotation tool"
        toggled={tool === ToolType.ADD_ANNOTATION}
        onClick={() => setTool(ToolType.ADD_ANNOTATION)}
      />
    </Tooltip>
  );
};
