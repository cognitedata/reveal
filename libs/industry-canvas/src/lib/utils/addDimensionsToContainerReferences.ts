import { isNotUndefined } from '@cognite/data-exploration';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { max } from 'lodash';
import {
  ContainerReference,
  ContainerReferenceType,
  ContainerReferenceWithoutDimensions,
  Dimensions,
} from '../types';
import assertNever from './assertNever';

const INITIAL_CONTAINER_MARGIN = 100;
export const DEFAULT_TIMESERIES_HEIGHT = 700;
export const DEFAULT_TIMESERIES_WIDTH = 1000;

export const DEFAULT_ASSET_WIDTH = 600;
export const DEFAULT_ASSET_HEIGHT = 500;

const getInitialContainerReferenceDimensions = (
  currentMaxX: number,
  containerReference: ContainerReferenceWithoutDimensions
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

  assertNever(
    containerReference,
    'Unsupported container reference type: ' + containerReferenceType
  );
};

const addDimensionsToContainerReferences = (
  unifiedViewer: UnifiedViewer,
  containerReferencesWithoutDimensions: ContainerReferenceWithoutDimensions[]
): ContainerReference[] => {
  let maxX =
    max(
      unifiedViewer
        .getContainers()
        .map((container) =>
          unifiedViewer.getContainerRectRelativeToStageById(container.id)
        )
        .filter(isNotUndefined)
        .map((containerRect) => containerRect.x + containerRect.width)
    ) ?? 0;

  // TODO: If several vertical containers (smaller than the specified `maxWidth`) are added at once it can lead to large gaps between the containers.
  //       Ideally we should have an API in UnifiedViewer to place the new containers compactly.
  return containerReferencesWithoutDimensions.map(
    (containerReferenceWithoutDimensions) => {
      const dimensions = getInitialContainerReferenceDimensions(
        maxX,
        containerReferenceWithoutDimensions
      );
      maxX = dimensions.x + (dimensions.width ?? dimensions.maxWidth ?? 0);
      return { ...containerReferenceWithoutDimensions, ...dimensions };
    }
  );
};

export default addDimensionsToContainerReferences;
