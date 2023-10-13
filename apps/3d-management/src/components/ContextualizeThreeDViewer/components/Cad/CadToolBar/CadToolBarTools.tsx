import { type ReactElement } from 'react';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';

import {
  setTool,
  ToolType,
  useCadContextualizeStore,
} from '../useCadContextualizeStore';

export const CadToolBarTools = (): ReactElement => {
  const { tool } = useCadContextualizeStore((state) => ({
    tool: state.tool,
  }));

  const handleAddClick = () => {
    setTool(ToolType.ADD_ANNOTATION);
  };

  return (
    <ToolBar direction="vertical">
      <>
        <Tooltip content="Add contextualization" position="right">
          <Button
            icon="AddLarge"
            type="ghost"
            aria-label="Add contextualization tool"
            toggled={tool === ToolType.ADD_ANNOTATION}
            onClick={handleAddClick}
          />
        </Tooltip>
      </>
    </ToolBar>
  );
};