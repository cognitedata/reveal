import { toast } from '@cognite/cogs.js';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { useCallback } from 'react';
import { TOAST_POSITION } from '../constants';
import addDimensionsToContainerReferences from '../utils/addDimensionsToContainerReferences';
import {
  ContainerReference,
  ContainerReferenceWithoutDimensions,
} from '../types';

export type OnAddContainerReferences = (
  containerReferences: ContainerReferenceWithoutDimensions[]
) => void;

export const useIndustryCanvasAddContainerReferences = ({
  unifiedViewer,
  addContainerReferences,
}: {
  unifiedViewer: UnifiedViewer | null;
  addContainerReferences: (containerReferences: ContainerReference[]) => void;
}): OnAddContainerReferences => {
  const onAddContainerReferences = useCallback(
    (containerReferences: ContainerReferenceWithoutDimensions[]) => {
      if (unifiedViewer === null) {
        console.warn("Can't add container references to null unifiedViewer");
        return;
      }

      addContainerReferences(
        addDimensionsToContainerReferences(unifiedViewer, containerReferences)
      );

      toast.success(
        <div>
          <h4>Resource(s) added to your canvas</h4>
        </div>,
        {
          toastId: `canvas-file-added-${containerReferences
            .map((f) => f.id)
            .join('-')}`,
          position: TOAST_POSITION,
        }
      );
    },
    [addContainerReferences, unifiedViewer]
  );

  return onAddContainerReferences;
};
