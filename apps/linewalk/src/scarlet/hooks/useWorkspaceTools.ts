import { useCallback, useMemo } from 'react';
import { Annotation, AppActionType, WorkspaceTool } from 'scarlet/types';

import { useAppDispatch, useDataPanelState } from '.';

export const useWorkspaceTools = () => {
  const appDispatch = useAppDispatch();
  const { visibleDataElement } = useDataPanelState();

  const enabledTools = useMemo(() => {
    const tools = [WorkspaceTool.MOVE];
    if (visibleDataElement) tools.push(WorkspaceTool.RECTANGLE);
    return tools;
  }, [visibleDataElement]);

  const onNewDetection = useCallback(
    (annotation: Annotation) => {
      appDispatch({
        type: AppActionType.ADD_DETECTION,
        dataElement: visibleDataElement!,
        annotation,
      });
    },
    [visibleDataElement]
  );

  return {
    enabledTools,
    onNewDetection,
  };
};
