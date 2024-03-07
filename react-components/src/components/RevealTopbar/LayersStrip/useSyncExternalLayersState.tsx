import { useReveal } from '../../..';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { LayersUrlStateParam } from '../../../hooks/types';
import { updateExternalStateFromLayerHandlers } from './updateExternalStateFromLayerHandlers';
import { updateViewerFromExternalState } from './updateViewerFromExternalState';
import { ModelLayerHandlers } from './LayersButtonsStrip';

export const useSyncExternalLayersState = (
  modelLayerHandlers: ModelLayerHandlers,
  externalLayersState: LayersUrlStateParam | undefined,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam>> | undefined,
  update: () => void
): void => {
  const lastExternalState = useRef(externalLayersState);
  const lastModelLayerHandlers = useRef(modelLayerHandlers);

  const viewer = useReveal();

  useEffect(() => {
    if (externalLayersState === undefined || setExternalLayersState === undefined) {
      return;
    }

    if (areLayerStatesConsistent(modelLayerHandlers, externalLayersState)) {
      return;
    }

    if (lastModelLayerHandlers.current === modelLayerHandlers) {
      // Change happened in external state
      updateViewerFromExternalState({ layersState: externalLayersState, viewer });
      update();
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
  externalState: LayersUrlStateParam
): boolean {
  const cadsConsistent =
    externalState.cadLayers?.every(
      (layer, index) =>
        handlers.cadHandlers[index].getRevisionId() === layer.revisionId &&
        handlers.cadHandlers[index].visible() === layer.applied
    ) ?? false;

  const pointCloudsConsistent =
    externalState.pointCloudLayers?.every(
      (layer, index) =>
        handlers.pointCloudHandlers[index].getRevisionId() === layer.revisionId &&
        handlers.pointCloudHandlers[index].visible() === layer.applied
    ) ?? false;

  const image360sConsistent =
    externalState.image360Layers?.every(
      (layer) =>
        handlers.image360Handlers.find((image) => image.getSiteId() === layer.siteId)?.visible() ===
        layer.applied
    ) ?? false;

  return cadsConsistent && pointCloudsConsistent && image360sConsistent;
}
