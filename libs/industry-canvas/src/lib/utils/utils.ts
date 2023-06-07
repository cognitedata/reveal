import { differenceBy } from 'lodash';

import { CogniteClient } from '@cognite/sdk/dist/src/index';
import { IdsByType } from '@cognite/unified-file-viewer';

import containerConfigToContainerReference from '../containerConfigToContainerReference';
import { EMPTY_FLEXIBLE_LAYOUT } from '../hooks/constants';
import resolveContainerConfig from '../hooks/utils/resolveContainerConfig';
import {
  IndustryCanvasState,
  SerializedIndustryCanvasState,
  IndustryCanvasContainerConfig,
  SerializedCanvasDocument,
  CanvasDocument,
} from '../types';

import { isNotUndefined } from './isNotUndefined';

export const serializeCanvasState = (
  state: IndustryCanvasState
): SerializedIndustryCanvasState => {
  return {
    canvasAnnotations: state.canvasAnnotations,
    containerReferences:
      state.container.children?.map((childContainerConfig) =>
        containerConfigToContainerReference(childContainerConfig)
      ) ?? [],
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
          state.containerReferences?.map((containerReference) =>
            resolveContainerConfig(sdk, containerReference)
          )
        ),
      } as IndustryCanvasContainerConfig,
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
      currentState.containerReferences.map((ref) => ref.id),
      prevState.containerReferences.map((ref) => ref.id)
    ).filter(isNotUndefined),
  };
};
