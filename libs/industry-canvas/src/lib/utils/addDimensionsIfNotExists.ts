import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { CanvasAnnotation, ContainerReference } from '../types';
import addDimensionsToContainerReference from './addDimensionsToContainerReference';

const addDimensionsIfNotExists = (
  unifiedViewer: UnifiedViewer,
  containerReferences: ContainerReference[],
  canvasAnnotations: CanvasAnnotation[]
): ContainerReference[] => {
  let maxX: number | undefined = undefined;

  return containerReferences.map((containerReference) => {
    if (
      containerReference.x !== undefined &&
      containerReference.y !== undefined
    ) {
      return containerReference;
    }

    const { maxX: nextMaxX, containerReference: nextContainerReference } =
      addDimensionsToContainerReference(
        unifiedViewer,
        containerReference,
        canvasAnnotations,
        maxX
      );
    maxX = nextMaxX;
    return nextContainerReference;
  });
};

export default addDimensionsIfNotExists;
