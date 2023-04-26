import { isNotUndefined } from '@cognite/data-exploration';
import {
  UnifiedViewer,
  isConnectionAnnotation,
  isEllipseAnnotation,
  isImageAnnotation,
  isLabelAnnotation,
  isPolylineAnnotation,
  isTextAnnotation,
} from '@cognite/unified-file-viewer';
import { max } from 'lodash';
import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceType,
  Dimensions,
} from '../types';
import assertNever from './assertNever';

const INITIAL_CONTAINER_MARGIN = 100;
export const DEFAULT_TIMESERIES_HEIGHT = 400;
export const DEFAULT_TIMESERIES_WIDTH = 700;
export const DEFAULT_ASSET_WIDTH = 600;
export const DEFAULT_ASSET_HEIGHT = 500;
export const DEFAULT_EVENT_WIDTH = 600;
export const DEFAULT_EVENT_HEIGHT = 500;
export const DEFAULT_THREE_D_WIDTH = 600;
export const DEFAULT_THREE_D_HEIGHT = 400;
const getInitialContainerReferenceDimensions = (
  currentMaxX: number,
  containerReference: ContainerReference
): Dimensions => {
  const containerReferenceType = containerReference.type;
  if (containerReferenceType === ContainerReferenceType.FILE) {
    return {
      x: currentMaxX + INITIAL_CONTAINER_MARGIN,
      y: 0,
      maxWidth: 1000,
      maxHeight: 1000,
    };
  }

  if (containerReferenceType === ContainerReferenceType.TIMESERIES) {
    return {
      x: currentMaxX + INITIAL_CONTAINER_MARGIN,
      y: 0,
      width: DEFAULT_TIMESERIES_WIDTH,
      height: DEFAULT_TIMESERIES_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.ASSET) {
    return {
      x: currentMaxX + INITIAL_CONTAINER_MARGIN,
      y: 0,
      width: DEFAULT_ASSET_WIDTH,
      height: DEFAULT_ASSET_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.EVENT) {
    return {
      x: currentMaxX + INITIAL_CONTAINER_MARGIN,
      y: 0,
      width: DEFAULT_EVENT_WIDTH,
      height: DEFAULT_EVENT_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.THREE_D) {
    return {
      x: currentMaxX + INITIAL_CONTAINER_MARGIN,
      y: 0,
      width: DEFAULT_THREE_D_WIDTH,
      height: DEFAULT_THREE_D_HEIGHT,
    };
  }

  assertNever(
    containerReference,
    'Unsupported container reference type: ' + containerReferenceType
  );
};

const DEFAULT_WIDTH_FOR_TEXT_ANNOTATIONS = 100;
const getRightMostPointOfCanvasAnnotation = (
  canvasAnnotation: CanvasAnnotation
): number | undefined => {
  if (isPolylineAnnotation(canvasAnnotation)) {
    return max(canvasAnnotation.vertices.map((point) => point.x)) ?? 0;
  }

  if (isConnectionAnnotation(canvasAnnotation)) {
    return undefined;
  }

  if (isImageAnnotation(canvasAnnotation)) {
    return canvasAnnotation.x + canvasAnnotation.size;
  }

  if (
    isTextAnnotation(canvasAnnotation) ||
    isLabelAnnotation(canvasAnnotation)
  ) {
    return canvasAnnotation.x + DEFAULT_WIDTH_FOR_TEXT_ANNOTATIONS;
  }

  if (isEllipseAnnotation(canvasAnnotation)) {
    const radiusX =
      typeof canvasAnnotation.radius === 'number'
        ? canvasAnnotation.radius
        : canvasAnnotation.radius.x;
    return canvasAnnotation.x + radiusX;
  }

  return canvasAnnotation.x + canvasAnnotation.width;
};

const addDimensionsToContainerReference = (
  unifiedViewer: UnifiedViewer,
  containerReferenceWithoutDimensions: ContainerReference,
  canvasAnnotations: CanvasAnnotation[],
  initialMaxX: number | undefined
): {
  maxX: number;
  containerReference: ContainerReference;
} => {
  const canvasAnnotationMaxX = max(
    canvasAnnotations
      .map(getRightMostPointOfCanvasAnnotation)
      .filter(isNotUndefined)
  );

  const containerMaxX = max(
    unifiedViewer
      .getContainers()
      .map((container) =>
        unifiedViewer.getContainerRectRelativeToStageById(container.id)
      )
      .filter(isNotUndefined)
      .map((containerRect) => containerRect.x + containerRect.width)
  );

  const maxX = initialMaxX ?? max([canvasAnnotationMaxX, containerMaxX]) ?? 0;

  const dimensions = getInitialContainerReferenceDimensions(
    maxX,
    containerReferenceWithoutDimensions
  );
  return {
    maxX: dimensions.x + (dimensions.width ?? dimensions.maxWidth ?? 0),
    containerReference: {
      ...containerReferenceWithoutDimensions,
      ...dimensions,
    },
  };
};

export default addDimensionsToContainerReference;
