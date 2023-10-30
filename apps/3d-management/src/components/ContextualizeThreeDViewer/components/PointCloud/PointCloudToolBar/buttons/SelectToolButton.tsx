import { Button, Tooltip } from '@cognite/cogs.js';

import {
  ToolType,
  setTool,
  useContextualizeThreeDViewerStore,
} from '../../../../useContextualizeThreeDViewerStore';

export const SelectToolButton = () => {
  const { tool } = useContextualizeThreeDViewerStore((state) => ({
    tool: state.tool,
  }));

  return (
    <Tooltip content="Select tool" position="right">
      <Button
        icon="Cursor"
        type="ghost"
        aria-label="Select tool"
        toggled={tool === ToolType.SELECT_TOOL}
        onClick={() => setTool(ToolType.SELECT_TOOL)}
      />
    </Tooltip>
  );
};
