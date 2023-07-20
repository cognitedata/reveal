import { differenceBy, partition } from 'lodash';

import { CogniteClient } from '@cognite/sdk/dist/src/index';
import { IdsByType } from '@cognite/unified-file-viewer';

import containerConfigToContainerReference from '../containerConfigToContainerReference';
import { EMPTY_FLEXIBLE_LAYOUT } from '../hooks/constants';
import resolveContainerConfig from '../hooks/utils/resolveContainerConfig';
import {
  IndustryCanvasState,
  SerializedIndustryCanvasState,
  SerializedCanvasDocument,
  CanvasDocument,
  isFdmInstanceContainerReference,
} from '../types';

import { isNotUndefined } from './isNotUndefined';

export const serializeCanvasState = (
  state: IndustryCanvasState
): SerializedIndustryCanvasState => {
  const containerReferences = (state.container.children ?? []).map(
    containerConfigToContainerReference
  );
  const [fdmInstanceContainerReferences, assetCentricContainerReferences] =
    partition(containerReferences, isFdmInstanceContainerReference);
  return {
    canvasAnnotations: state.canvasAnnotations,
    containerReferences: assetCentricContainerReferences,
    fdmInstanceContainerReferences: fdmInstanceContainerReferences,
  };
};

export const deserializeCanvasState = async (
  sdk: CogniteClient,
  state: SerializedIndustryCanvasState
): Promise<IndustryCanvasState> => {
  try {
    return {
      canvasAnnotations: state.canvasAnnotations,
      container: {
        ...EMPTY_FLEXIBLE_LAYOUT,
        children: await Promise.all(
          [
            ...state.containerReferences,
            ...state.fdmInstanceContainerReferences,
          ].map((containerReference) =>
            resolveContainerConfig(sdk, containerReference)
          )
        ),
      },
    };
  } catch (error) {
    console.error('Error deserializing canvas container', error);
    return {
      container: EMPTY_FLEXIBLE_LAYOUT,
      canvasAnnotations: [],
    };
  }
};

export const deserializeCanvasDocument = async (
  sdk: CogniteClient,
  canvasDocument: SerializedCanvasDocument
): Promise<CanvasDocument> => {
  return {
    ...canvasDocument,
    data: await deserializeCanvasState(sdk, canvasDocument.data),
  };
};

const getContainerReferenceIds = (state: SerializedIndustryCanvasState) =>
  [...state.containerReferences, ...state.fdmInstanceContainerReferences].map(
    (ref) => ref.id
  );

export const getRemovedIdsByType = (
  currentState: SerializedIndustryCanvasState,
  prevState: SerializedIndustryCanvasState
): IdsByType => {
  return {
    annotationIds: differenceBy(
      currentState.canvasAnnotations.map((anno) => anno.id),
      prevState.canvasAnnotations.map((anno) => anno.id)
    ),
    containerIds: differenceBy(
      getContainerReferenceIds(currentState),
      getContainerReferenceIds(prevState)
    ).filter(isNotUndefined),
  };
};
