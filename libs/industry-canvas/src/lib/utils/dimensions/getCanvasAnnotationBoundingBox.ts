import {
  isEllipseAnnotation,
  isImageAnnotation,
  isLabelAnnotation,
  isPolylineAnnotation,
  isTextAnnotation,
} from '@cognite/unified-file-viewer';

import { CanvasAnnotation } from '../../types';

const DEFAULT_WIDTH_FOR_TEXT_ANNOTATIONS = 100;
const DEFAULT_HEIGHT_FOR_TEXT_ANNOTATIONS = 100;

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const getCanvasAnnotationBoundingBox = (
  canvasAnnotation: CanvasAnnotation
): BoundingBox | undefined => {
  if (isPolylineAnnotation(canvasAnnotation)) {
    if (
      canvasAnnotation.vertices === undefined ||
      canvasAnnotation.vertices.length === 0
    ) {
      return undefined;
    }
    const xValues = canvasAnnotation.vertices.map((point) => point.x);
    const yValues = canvasAnnotation.vertices.map((point) => point.y);
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
  }

  if (isImageAnnotation(canvasAnnotation)) {
    return {
      x: canvasAnnotation.x,
      y: canvasAnnotation.y,
      width: canvasAnnotation.size,
      height: canvasAnnotation.size,
    };
  }

  if (
    isTextAnnotation(canvasAnnotation) ||
    isLabelAnnotation(canvasAnnotation)
  ) {
    return {
      x: canvasAnnotation.x,
      y: canvasAnnotation.y,
      width: DEFAULT_WIDTH_FOR_TEXT_ANNOTATIONS,
      height: DEFAULT_HEIGHT_FOR_TEXT_ANNOTATIONS,
    };
  }

  if (isEllipseAnnotation(canvasAnnotation)) {
    const radiusX =
      typeof canvasAnnotation.radius === 'number'
        ? canvasAnnotation.radius
        : canvasAnnotation.radius.x;
    const radiusY =
      typeof canvasAnnotation.radius === 'number'
        ? canvasAnnotation.radius
        : canvasAnnotation.radius.y;

    return {
      x: canvasAnnotation.x - radiusX,
      y: canvasAnnotation.y - radiusY,
      width: radiusX * 2,
      height: radiusY * 2,
    };
  }

  return {
    x: canvasAnnotation.x,
    y: canvasAnnotation.y,
    width: canvasAnnotation.width,
    height: canvasAnnotation.height,
  };
};
