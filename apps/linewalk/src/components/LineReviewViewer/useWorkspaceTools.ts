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
  ornateRefs: (CogniteOrnate | undefined)[],
  options: {
    onDiscrepancyCreate?: (id: string, groupId: string, attrs: any) => void;
  } = {}
) => {
  const [tool, onToolChange] = useState<WorkspaceTool>(WorkspaceTool.DEFAULT);
  const toolsRefs = useRef<
    {
      move: MoveTool;
      rect: DiscrepancyTool;
      default: DefaultTool;
      text: TextTool;
    }[]
  >([]);

  useEffect(() => {
    ornateRefs.forEach((ornateRef, index) => {
      if (ornateRef) {
        toolsRefs.current[index] = {
          move: new MoveTool(ornateRef),
          rect: new DiscrepancyTool(ornateRef),
          text: new TextTool(ornateRef),
          default: new DefaultTool(ornateRef),
        };
      }
    });
  }, [ornateRefs]);

  useEffect(() => {
    ornateRefs.forEach((ornateRef, index) => {
      if (ornateRef) {
        // eslint-disable-next-line no-param-reassign
        ornateRef.tools = toolsRefs.current[index] as unknown as Record<
          string,
          Tool
        >;
      }
    });
  }, [ornateRefs]);

  useEffect(() => {
    ornateRefs
      .filter((ornateRef) => ornateRef !== undefined)
      .forEach((ornateRef, index) => {
        if (
          ornateRef &&
          toolsRefs.current[index] &&
          options.onDiscrepancyCreate
        ) {
          toolsRefs.current[index].rect.addEventListener(
            EventType.ON_CREATE_END,
            options.onDiscrepancyCreate
          );
        }
      });

    return () => {
      ornateRefs.forEach((ornateRef, index) => {
        if (options.onDiscrepancyCreate) {
          toolsRefs.current[index]?.rect.removeEventListener(
            EventType.ON_CREATE_END,
            options.onDiscrepancyCreate
          );
        }
      });
    };
  }, [options.onDiscrepancyCreate]);

  useEffect(() => {
    ornateRefs.forEach((ornateRef) => {
      if (ornateRef?.tools[tool] !== undefined) {
        ornateRef?.handleToolChange(tool as ToolType);
      }
    });
  }, [ornateRefs, tool]);

  return {
    tool,
    onToolChange,
  };
};

export default useWorkspaceTools;
