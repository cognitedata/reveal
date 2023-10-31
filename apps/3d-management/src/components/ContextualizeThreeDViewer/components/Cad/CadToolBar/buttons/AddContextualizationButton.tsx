import { Button, Tooltip } from '@cognite/cogs.js';

import {
  ToolType,
  setTool,
  useCadContextualizeStore,
} from '../../useCadContextualizeStore';

export const AddContextualizationButton = () => {
  const { tool } = useCadContextualizeStore((state) => ({
    tool: state.tool,
  }));

  return (
    <Tooltip content="Create" position="right">
      <Button
        icon="AddLarge"
        type="ghost"
        aria-label="Create tool"
        toggled={tool === ToolType.ADD_ANNOTATION}
        onClick={() => setTool(ToolType.ADD_ANNOTATION)}
      />
    </Tooltip>
  );
};
