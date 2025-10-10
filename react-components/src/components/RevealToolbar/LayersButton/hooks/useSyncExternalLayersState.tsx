import { useReveal } from '../../../RevealCanvas';
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { type LayersUrlStateParam, type ModelLayerHandlers } from '../types';
import { updateExternalStateFromLayerHandlers } from '../updateExternalStateFromLayerHandlers';
import { updateViewerFromExternalState } from '../updateViewerFromExternalState';
import { type UpdateModelHandlersCallback } from './useModelHandlers';
import { RevealRenderTarget } from '../../../../architecture';

export const useSyncExternalLayersState = (
  modelLayerHandlers: ModelLayerHandlers,
  externalLayersState: LayersUrlStateParam | undefined,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  renderTarget: RevealRenderTarget
  // update: UpdateModelHandlersCallback
): void => {
  const lastExternalState = useRef(externalLayersState);
  const lastModelLayerHandlers = useRef(modelLayerHandlers);

  const viewer = useReveal();

  useEffect(() => {
    if (areLayerStatesConsistent(modelLayerHandlers, externalLayersState, renderTarget)) {
      lastExternalState.current = externalLayersState;
      lastModelLayerHandlers.current = modelLayerHandlers;
      return;
    }

    if (
      lastModelLayerHandlers.current === modelLayerHandlers ||
      lastExternalState.current !== externalLayersState
    ) {
      console.log(
        'Updating local state from external state because',
        lastModelLayerHandlers.current === modelLayerHandlers,
        lastExternalState.current !== externalLayersState
      );
      // Change happened in external state
      updateViewerFromExternalState(externalLayersState, modelLayerHandlers, renderTarget);
      // update(viewer.models, viewer.get360ImageCollections());
    } else {
      // Change happened in local state
      console.log('Updating external state from local state');
      updateExternalStateFromLayerHandlers(
        modelLayerHandlers,
        setExternalLayersState,
        renderTarget
      );
    }

    lastExternalState.current = externalLayersState;
    lastModelLayerHandlers.current = modelLayerHandlers;
  }, [externalLayersState, modelLayerHandlers]);
};

function areLayerStatesConsistent(
  handlers: ModelLayerHandlers,
  externalState: LayersUrlStateParam | undefined,
  renderTarget: RevealRenderTarget
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
        handlers.cadHandlers[index].model.revisionId === layer.revisionId &&
        handlers.cadHandlers[index].isVisible(renderTarget) === layer.applied
    ) ??
      false);

  const pointCloudsConsistent =
    externalState.pointCloudLayers?.length === handlers.pointCloudHandlers.length &&
    (externalState.pointCloudLayers?.every(
      (layer, index) =>
        handlers.pointCloudHandlers[index].model.revisionId === layer.revisionId &&
        handlers.pointCloudHandlers[index].isVisible(renderTarget) === layer.applied
    ) ??
      false);

  const image360sConsistent =
    externalState.image360Layers?.length === handlers.image360Handlers.length &&
    (externalState.image360Layers?.every(
      (layer) =>
        handlers.image360Handlers
          .find((image) => image.model.id === layer.siteId)
          ?.isVisible(renderTarget) === layer.applied
    ) ??
      false);

  return cadsConsistent && pointCloudsConsistent && image360sConsistent;
}
