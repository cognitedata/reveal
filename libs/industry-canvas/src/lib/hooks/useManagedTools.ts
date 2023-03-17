import { useCallback, useState } from 'react';
import { ToolType } from '@cognite/unified-file-viewer';

type ToolOptions = Record<string, any>;

const DEFAULT_STYLE = {
  fill: 'rgba(0, 179, 230, 0.5)',
  stroke: '#000000',
  strokeWidth: 5,
  isWorkspaceAnnotation: true,
};

const DEFAULT_TOOL_OPTIONS: Record<ToolType, ToolOptions> = {
  [ToolType.RECTANGLE]: DEFAULT_STYLE,
  [ToolType.ELLIPSE]: DEFAULT_STYLE,
  [ToolType.POLYLINE]: DEFAULT_STYLE,
  [ToolType.TEXT]: {
    fontSize: 16,
    strokeWidth: 0,
    fill: '#000000',
    stroke: '#000000',
  },
  [ToolType.SELECT]: DEFAULT_STYLE,
  [ToolType.LINE]: DEFAULT_STYLE,
  [ToolType.IMAGE]: {},
  [ToolType.PAN]: {},
};

type ToolState = {
  tool: ToolType;
  optionsByToolType: Record<ToolType, ToolOptions>;
};

const useManagedTools = (
  initialTool: ToolType
): {
  tool: ToolType;
  toolOptions: ToolOptions;
  toolsOptions: Record<ToolType, ToolOptions>;
  setTool: (nextTool: ToolType, options?: ToolOptions) => void;
} => {
  const [{ tool, optionsByToolType }, setToolState] = useState<ToolState>({
    tool: initialTool,
    optionsByToolType: DEFAULT_TOOL_OPTIONS,
  });

  const setTool = useCallback((nextTool: ToolType, options?: ToolOptions) => {
    setToolState((prevState) => ({
      tool: nextTool,
      optionsByToolType: {
        ...prevState.optionsByToolType,
        [nextTool]:
          options === undefined
            ? prevState.optionsByToolType[nextTool]
            : options,
      },
    }));
  }, []);

  return {
    tool,
    toolOptions: optionsByToolType[tool],
    toolsOptions: optionsByToolType,
    setTool,
  };
};

export default useManagedTools;
