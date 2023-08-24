import { partition } from 'lodash';
import { v4 as uuid } from 'uuid';

import {
  DEFAULT_CANVAS_NAME,
  CanvasVisibility,
} from '../services/IndustryCanvasService';
import {
  SerializedCanvasDocument,
  SerializedIndustryCanvasState,
  isFdmInstanceContainerReference,
} from '../types';

import { addIdToContainerReference } from './addIdToContainerReference';
import { addDimensionsToContainerReferencesIfNotExists } from './dimensions';

export type CreateSerializedCanvasDocumentOptions = {
  name?: string;
} & Partial<SerializedIndustryCanvasState>;

export const createSerializedCanvasDocument = (
  userIdentifier: string,
  options?: CreateSerializedCanvasDocumentOptions
): SerializedCanvasDocument => {
  const canvasAnnotations = options?.canvasAnnotations ?? [];

  const containerReferencesWithDimensions =
    addDimensionsToContainerReferencesIfNotExists(
      [
        ...(options?.containerReferences ?? []),
        ...(options?.fdmInstanceContainerReferences ?? []),
      ].map(addIdToContainerReference),
      {
        containerReferences: [],
        canvasAnnotations,
        fdmInstanceContainerReferences: [],
        context: [],
      }
    );

  const [fdmInstanceContainerReferences, containerReferences] = partition(
    containerReferencesWithDimensions,
    isFdmInstanceContainerReference
  );

  return {
    externalId: uuid(),
    name: options?.name || DEFAULT_CANVAS_NAME,
    visibility: CanvasVisibility.PRIVATE, // Default visibility for a new canvas is 'private'.
    createdTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: userIdentifier,
    createdBy: userIdentifier,
    data: {
      containerReferences,
      canvasAnnotations,
      fdmInstanceContainerReferences,
      context: [],
    },
  };
};
