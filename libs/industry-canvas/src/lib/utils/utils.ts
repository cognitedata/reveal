import { CogniteClient } from '@cognite/sdk/dist/src/index';
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
