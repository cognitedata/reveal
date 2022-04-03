import {
  CogniteOrnate,
  DefaultTool,
  MoveTool,
  TextTool,
  Tool,
  ToolType,
} from '@cognite/ornate';
import { useEffect, useRef, useState } from 'react';

import DiscrepancyTool, { EventType } from './DiscrepancyTool';

export enum WorkspaceTool {
  DEFAULT = 'default',
  MOVE = 'move',
  RECTANGLE = 'rect',
  TEXT = 'text',
}

const useWorkspaceTools = (
  ornateRef: CogniteOrnate | undefined,
  options: {
    onDiscrepancyCreate?: (id: string, groupId: string) => void;
  } = {}
) => {
  const [tool, onToolChange] = useState<WorkspaceTool>(WorkspaceTool.DEFAULT);
  const toolRefs = useRef<
    | {
        move: MoveTool;
        rect: DiscrepancyTool;
        default: DefaultTool;
        text: TextTool;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    if (ornateRef) {
      toolRefs.current = {
        move: new MoveTool(ornateRef),
        rect: new DiscrepancyTool(ornateRef),
        text: new TextTool(ornateRef),
        default: new DefaultTool(ornateRef),
      };
    }
  }, [ornateRef]);

  useEffect(() => {
    if (ornateRef) {
      // eslint-disable-next-line no-param-reassign
      ornateRef.tools = toolRefs.current as unknown as Record<string, Tool>;
    }
  }, [ornateRef]);

  useEffect(() => {
    if (ornateRef && toolRefs.current && options.onDiscrepancyCreate) {
      toolRefs.current.rect.addEventListener(
        EventType.ON_CREATE_END,
        options.onDiscrepancyCreate
      );
    }

    return () => {
      if (options.onDiscrepancyCreate) {
        toolRefs.current?.rect.removeEventListener(
          EventType.ON_CREATE_END,
          options.onDiscrepancyCreate
        );
      }
    };
  }, [options.onDiscrepancyCreate]);

  useEffect(() => {
    if (ornateRef?.tools[tool] !== undefined) {
      ornateRef?.handleToolChange(tool as ToolType);
    }
  }, [ornateRef, tool]);

  return {
    tool,
    onToolChange,
  };
};

export default useWorkspaceTools;
