import {
  CogniteOrnate,
  DefaultTool,
  MoveTool,
  ToolType,
} from '@cognite/ornate';
import { useEffect, useState } from 'react';

// WorkspaceTool is a superset of Ornate ToolType since some tools
// in the menu are not related to Ornate but to the rest of the
// application
export enum WorkspaceTool {
  LAYERS = 'layers',
  // NOTE: These are the same as OrnateTool
  SELECT = 'select',
  MOVE = 'move',
  LINE = 'line',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TEXT = 'text',
  COMMENT = 'comment',
  SQUIGGLE = 'squiggle',
  LINK = 'link',
}

// TODOO: Improve, this is not strictly correct
const isOrnateTool = (tool: string): tool is ToolType =>
  ['move', 'default', 'select'].includes(tool as ToolType);

const useWorkspaceTools = (ornateRef: CogniteOrnate | undefined) => {
  const [tool, onToolChange] = useState<WorkspaceTool>(WorkspaceTool.MOVE);

  useEffect(() => {
    if (ornateRef) {
      const moveTool = new MoveTool(ornateRef);
      // eslint-disable-next-line no-param-reassign
      ornateRef.tools = {
        move: moveTool,
        select: new DefaultTool(ornateRef),
        default: moveTool,
      };
    }
  }, [ornateRef]);

  useEffect(() => {
    if (isOrnateTool(tool)) {
      ornateRef?.handleToolChange(tool);
    } else {
      ornateRef?.handleToolChange('default');
    }
  }, [ornateRef, tool]);

  return {
    tool,
    onToolChange,
  };
};

export default useWorkspaceTools;
