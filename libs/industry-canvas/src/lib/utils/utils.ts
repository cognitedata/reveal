import { ContainerConfig } from '@cognite/unified-file-viewer';
import {
  IndustryCanvasState,
  ContainerReference,
  ContainerReferenceType,
} from '../types';
import assertNever from './assertNever';

export const getContainerId = (
  containerReference: ContainerReference
): string => {
  if (containerReference.type === ContainerReferenceType.FILE) {
    return `${containerReference.resourceId}`;
  }

  if (containerReference.type === ContainerReferenceType.TIMESERIES) {
    return `${containerReference.resourceId}-${containerReference.id}`;
  }

  if (containerReference.type === ContainerReferenceType.ASSET) {
    return `${containerReference.resourceId}`;
  }

  if (containerReference.type === ContainerReferenceType.THREE_D) {
    return `${containerReference.id}`;
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

export const deserializeCanvasState = (
  state: IndustryCanvasState
): IndustryCanvasState => {
  try {
    const containerReferences = state.containerReferences.map(
      (containerReference) => {
        if (containerReference.type === ContainerReferenceType.TIMESERIES) {
          // We need to convert the dates to Date objects since they are serialized as strings in FDM
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
      ...state,
      containerReferences,
    };
  } catch (error) {
    console.error('Error deserializing canvas container', error);
    return {
      containerReferences: [],
      canvasAnnotations: [],
    };
  }
};
