import { useCallback, useEffect, useMemo } from 'react';

import { ToolConfig } from '@cognite/unified-file-viewer';

import { IndustryCanvasToolTypeByShortcutKey } from '../components/ToolbarComponent/ToolbarComponent';
import {
  setToolConfigByType,
  setToolType,
  ToolConfigByType,
  useIndustrialCanvasStore,
} from '../state/useIndustrialCanvasStore';
import { IndustryCanvasToolType } from '../types';
import { ExactlyOnePartial } from '../utils/ExactlyOnePartial';
import shouldFireToolKeyboardShortcut from '../utils/shouldFireToolKeyboardShortcut';

export type UseManagedToolReturnType = {
  toolType: IndustryCanvasToolType;
  tool: ToolConfig;
  updateStyleForToolType: (arg: ExactlyOnePartial<ToolConfigByType>) => void;
};

const useManagedTool = (): UseManagedToolReturnType => {
  const { toolType, toolConfigByType } = useIndustrialCanvasStore((state) => ({
    toolType: state.toolType,
    toolConfigByType: state.toolConfigByType,
  }));

  const updateStyleForToolType: UseManagedToolReturnType['updateStyleForToolType'] =
    useCallback(
      (arg) => {
        const toolType = Object.keys(arg)[0] as keyof ToolConfigByType;
        const updatedStyle = arg[toolType];
        const toolConfig = toolConfigByType[toolType];

        setToolConfigByType((toolConfigByType) => ({
          ...toolConfigByType,
          [toolType]: {
            ...toolConfig,
            ...updatedStyle,
          },
        }));
      },
      [toolConfigByType]
    );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldFireToolKeyboardShortcut(event)) {
        return;
      }

      const matchingIndustryCanvasToolType =
        IndustryCanvasToolTypeByShortcutKey[event.key];
      if (matchingIndustryCanvasToolType !== undefined) {
        setToolType(matchingIndustryCanvasToolType);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const tool = useMemo((): ToolConfig => {
    return toolConfigByType[toolType];
  }, [toolType, toolConfigByType]);

  return {
    tool,
    updateStyleForToolType,
    toolType,
  };
};

export default useManagedTool;
