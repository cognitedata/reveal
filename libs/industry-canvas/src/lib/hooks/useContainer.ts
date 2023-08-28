import { useMemo } from 'react';

import { UnifiedViewerMouseEvent } from '@cognite/unified-file-viewer';

import { setInteractionState } from '../state/useIndustrialCanvasStore';
import { IndustryCanvasContainerConfig, IndustryCanvasState } from '../types';

const useContainer = (
  canvasState: IndustryCanvasState
): IndustryCanvasContainerConfig => {
  return useMemo(() => {
    return {
      ...canvasState.container,
      children: canvasState.container.children?.map((containerConfig) => ({
        ...containerConfig,
        onClick: (e: UnifiedViewerMouseEvent) => {
          e.cancelBubble = true;
          setInteractionState({
            hoverId: undefined,
            clickedContainerAnnotationId: undefined,
          });
        },
      })) as IndustryCanvasContainerConfig[],
    };
  }, [canvasState.container]);
};

export default useContainer;
