import { useCallback, useMemo } from 'react';
import {
  Annotation,
  DataPanelActionType,
  DetectionType,
  WorkspaceTool,
} from 'types';

import { useDataPanelContext } from '.';

export const useWorkspaceTools = () => {
  const {
    dataPanelState: { visibleDataElement },
    dataPanelDispatch,
  } = useDataPanelContext();

  const enabledTools = useMemo(() => {
    const tools = [WorkspaceTool.MOVE];
    if (visibleDataElement) tools.push(WorkspaceTool.RECTANGLE);
    return tools;
  }, [visibleDataElement]);

  const onNewDetection = useCallback(
    (annotation: Annotation) => {
      dataPanelDispatch({
        type: DataPanelActionType.SET_NEW_MANUAL_DETECTION,
        detectionType: DetectionType.MANUAL,
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
