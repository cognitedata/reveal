import { ContainerReference, SerializedIndustryCanvasState } from '../../types';
import { isNotUndefined } from '../isNotUndefined';

import { getCanvasAnnotationBoundingBox } from './getCanvasAnnotationBoundingBox';

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const getEnclosingBoundingBox = (
  boundingBoxes: BoundingBox[]
): BoundingBox | undefined => {
  if (boundingBoxes.length === 0) {
    return undefined;
  }

  const xValues = boundingBoxes.flatMap((boundingBox) => [
    boundingBox.x,
    boundingBox.x + boundingBox.width,
  ]);
  const yValues = boundingBoxes.flatMap((boundingBox) => [
    boundingBox.y,
    boundingBox.y + boundingBox.height,
  ]);
  const minX = Math.min(...xValues);
  const minY = Math.min(...yValues);
  const maxX = Math.max(...xValues);
  const maxY = Math.max(...yValues);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getContainerReferenceBoundingBox = (
  containerReference: ContainerReference
): BoundingBox => {
  return {
    x: containerReference.x ?? 0,
    y: containerReference.y ?? 0,
    width: containerReference.width ?? containerReference.maxWidth ?? 0,
    height: containerReference.height ?? containerReference.maxHeight ?? 0,
  };
};

export const getCanvasStateBoundingBox = (
  canvasState: SerializedIndustryCanvasState
): BoundingBox | undefined => {
  const canvasBoundingBoxes = canvasState.canvasAnnotations
    .map(getCanvasAnnotationBoundingBox)
    .filter(isNotUndefined);

  const containerReferencesBoundingBoxes = canvasState.containerReferences
    .map(getContainerReferenceBoundingBox)
    .filter(isNotUndefined);

  const fdmInstanceContainerReferencesBoundingBoxes =
    canvasState.fdmInstanceContainerReferences
      .map(getContainerReferenceBoundingBox)
      .filter(isNotUndefined);

  return getEnclosingBoundingBox([
    ...canvasBoundingBoxes,
    ...containerReferencesBoundingBoxes,
    ...fdmInstanceContainerReferencesBoundingBoxes,
  ]);
};
