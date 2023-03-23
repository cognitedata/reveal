import { ContainerConfig } from '@cognite/unified-file-viewer';
import {
  CanvasState,
  ContainerReference,
  ContainerReferenceType,
} from '../types';
import assertNever from './assertNever';

export const getContainerId = (
  containerReference: ContainerReference
): string => {
  if (containerReference.type === ContainerReferenceType.FILE) {
    return `${containerReference.resourceId}-${containerReference.page}`;
  }

  if (containerReference.type === ContainerReferenceType.TIMESERIES) {
    return `${containerReference.resourceId}-${containerReference.id}`;
  }

  if (containerReference.type === ContainerReferenceType.ASSET) {
    return `${containerReference.resourceId}`;
  }

  assertNever(containerReference, 'Unsupported container reference type');
};

export const getContainerReferencesWithUpdatedDimensions = (
  containerReferences: ContainerReference[],
  container: ContainerConfig
): ContainerReference[] => {
  const containerReferencesById = new Map(
    containerReferences.map((containerReference) => [
      getContainerId(containerReference),
      containerReference,
    ])
  );

  container.children?.forEach((child) => {
    const containerReference = containerReferencesById.get(child.id ?? '');

    if (containerReference === undefined) {
      return;
    }

    containerReference.x = child.x ?? containerReference.x;
    containerReference.y = child.y ?? containerReference.y;
    containerReference.width = child.width;
    containerReference.height = child.height;
  });

  return Array.from(containerReferencesById.values());
};

const deserializeCanvasState = (value: string): CanvasState => {
  try {
    const canvasState = JSON.parse(value) as CanvasState;
    const containerReferences = canvasState.containerReferences.map(
      (containerReference) => {
        if (containerReference.type === ContainerReferenceType.TIMESERIES) {
          // We need to convert the dates to Date objects since they are serialized as strings
          return {
            ...containerReference,
            startDate: new Date(containerReference.startDate),
            endDate: new Date(containerReference.endDate),
          };
        }

        return containerReference;
      }
    );

    return {
      containerReferences,
      canvasAnnotations: canvasState.canvasAnnotations,
    };
  } catch (error) {
    console.error('Error deserializing canvas container', error);
    return {
      containerReferences: [],
      canvasAnnotations: [],
    };
  }
};

const CANVAS_STATE_KEY = 'COGNITE_CANVAS_STATE';

export const loadCanvasState = (): CanvasState | null => {
  const canvasStateString = localStorage.getItem(CANVAS_STATE_KEY);
  if (canvasStateString === null) {
    return null;
  }

  return deserializeCanvasState(canvasStateString);
};

export const saveCanvasState = (canvasState: CanvasState): void => {
  localStorage.setItem(CANVAS_STATE_KEY, JSON.stringify(canvasState));
};

export const clearCanvasState = (): void => {
  localStorage.removeItem(CANVAS_STATE_KEY);
};
