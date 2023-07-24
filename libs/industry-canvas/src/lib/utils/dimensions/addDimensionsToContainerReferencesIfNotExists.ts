import { ContainerReference, SerializedIndustryCanvasState } from '../../types';

import { getCanvasStateBoundingBox } from './getCanvasStateBoundingBox';
import { getInitialContainerReferenceSize } from './getInitialContainerReferenceSize';

const DEFAULT_Y = 0;
const MARGIN = 100;

export const addDimensionsToContainerReferencesIfNotExists = <
  T extends ContainerReference
>(
  containerReferencesToAddDimensionsTo: T[],
  canvasState: SerializedIndustryCanvasState
): T[] => {
  const canvasStateBoundingBox = getCanvasStateBoundingBox(canvasState);

  const initialX =
    canvasStateBoundingBox === undefined
      ? 0
      : canvasStateBoundingBox.x + canvasStateBoundingBox.width + MARGIN;

  let currentX = initialX;
  return containerReferencesToAddDimensionsTo.map((containerReference) => {
    if (
      containerReference.x !== undefined &&
      containerReference.y !== undefined
    ) {
      return containerReference;
    }

    const dimensions = {
      x: currentX,
      y: DEFAULT_Y,
      ...getInitialContainerReferenceSize(containerReference),
    };

    currentX = currentX + (dimensions.width ?? dimensions.maxWidth) + MARGIN;

    return {
      ...containerReference,
      ...dimensions,
    };
  });
};
