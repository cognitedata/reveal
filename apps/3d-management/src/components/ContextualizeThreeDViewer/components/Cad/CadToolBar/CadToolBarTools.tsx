import { type ReactElement } from 'react';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';

import {
  setTool,
  ToolType,
  useContextualizeThreeDViewerStoreCad,
} from '../../../useContextualizeThreeDViewerStoreCad';

export const CadToolBarTools = (): ReactElement => {
  const { tool } = useContextualizeThreeDViewerStoreCad((state) => ({
    tool: state.tool,
  }));

  const handleAddClick = () => {
    setTool(ToolType.ADD_ANNOTATION);
  };

  const handleDeleteClick = () => {
    setTool(ToolType.DELETE_ANNOTATION);
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
        <Tooltip content="Delete contextualization" position="right">
          <Button
            icon="Delete"
            type="ghost"
            aria-label="Delete contextualization tool"
            toggled={tool === ToolType.DELETE_ANNOTATION}
            onClick={handleDeleteClick}
          />
        </Tooltip>
      </>
    </ToolBar>
  );
};
