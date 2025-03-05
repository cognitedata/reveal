/*!
 * Copyright 2024 Cognite AS
 */
import { useReveal } from '../../../RevealCanvas';
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { type LayersUrlStateParam, type ModelLayerHandlers } from '../types';
import { updateExternalStateFromLayerHandlers } from '../updateExternalStateFromLayerHandlers';
import { updateViewerFromExternalState } from '../updateViewerFromExternalState';
import { type UpdateModelHandlersCallback } from './useModelHandlers';

export const useSyncExternalLayersState = (
  modelLayerHandlers: ModelLayerHandlers,
  externalLayersState: LayersUrlStateParam | undefined,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  update: UpdateModelHandlersCallback
): void => {
  const lastExternalState = useRef(externalLayersState);
  const lastModelLayerHandlers = useRef(modelLayerHandlers);

  const viewer = useReveal();

  useEffect(() => {
    if (areLayerStatesConsistent(modelLayerHandlers, externalLayersState)) {
      return;
    }

    if (
      lastModelLayerHandlers.current === modelLayerHandlers ||
      lastExternalState.current !== externalLayersState
    ) {
      // Change happened in external state
      updateViewerFromExternalState(externalLayersState, viewer);
      update(viewer.models, viewer.get360ImageCollections());
    } else {
      // Change happened in local state
      updateExternalStateFromLayerHandlers(modelLayerHandlers, setExternalLayersState);
    }

    lastExternalState.current = externalLayersState;
    lastModelLayerHandlers.current = modelLayerHandlers;
  }, [externalLayersState, modelLayerHandlers]);
};

function areLayerStatesConsistent(
  handlers: ModelLayerHandlers,
  externalState: LayersUrlStateParam | undefined
): boolean {
  if (externalState === undefined) {
    return (
      handlers.cadHandlers.length === 0 &&
      handlers.pointCloudHandlers.length === 0 &&
      handlers.image360Handlers.length === 0
    );
  }

  const cadsConsistent =
    externalState.cadLayers?.length === handlers.cadHandlers.length &&
    (externalState.cadLayers?.every(
      (layer, index) =>
        handlers.cadHandlers[index].getRevisionId() === layer.revisionId &&
        handlers.cadHandlers[index].visible() === layer.applied
    ) ??
      false);

  const pointCloudsConsistent =
    externalState.pointCloudLayers?.length === handlers.pointCloudHandlers.length &&
    (externalState.pointCloudLayers?.every(
      (layer, index) =>
        handlers.pointCloudHandlers[index].getRevisionId() === layer.revisionId &&
        handlers.pointCloudHandlers[index].visible() === layer.applied
    ) ??
      false);

  const image360sConsistent =
    externalState.image360Layers?.length === handlers.image360Handlers.length &&
    (externalState.image360Layers?.every(
      (layer) =>
        handlers.image360Handlers.find((image) => image.getSiteId() === layer.siteId)?.visible() ===
        layer.applied
    ) ??
      false);

  return cadsConsistent && pointCloudsConsistent && image360sConsistent;
}
