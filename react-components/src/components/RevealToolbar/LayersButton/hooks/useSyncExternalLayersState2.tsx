import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { type LayersUrlStateParam } from '../types';
import { type ModelLayerContent } from '../ModelLayerContent';
import { updateExternalStateFromLayerContent } from '../updateExternalStateFromLayerContent';
import { updateViewerFromExternalState } from '../updateViewerFromExternalState2';
import { type RevealRenderTarget } from '../../../../architecture';

export const useSyncExternalLayersState = (
  modelLayerContent: ModelLayerContent,
  externalLayersState: LayersUrlStateParam | undefined,
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  renderTarget: RevealRenderTarget
): void => {
  const lastExternalState = useRef(externalLayersState);
  const lastModelLayerContent = useRef(modelLayerContent);

  useEffect(() => {
    if (
      externalLayersState === undefined ||
      areLayerStatesConsistent(modelLayerContent, externalLayersState, renderTarget)
    ) {
      lastExternalState.current = externalLayersState;
      lastModelLayerContent.current = modelLayerContent;
      return;
    }

    if (
      lastModelLayerContent.current === modelLayerContent ||
      lastExternalState.current !== externalLayersState
    ) {
      // Change happened in external state
      updateViewerFromExternalState(externalLayersState, modelLayerContent, renderTarget);
    } else {
      // Change happened in local state
      updateExternalStateFromLayerContent(modelLayerContent, setExternalLayersState, renderTarget);
    }

    lastExternalState.current = externalLayersState;
    lastModelLayerContent.current = modelLayerContent;
  }, [externalLayersState, modelLayerContent]);
};

function areLayerStatesConsistent(
  models: ModelLayerContent,
  externalState: LayersUrlStateParam,
  renderTarget: RevealRenderTarget
): boolean {
  const externalCadLayers = externalState.cadLayers ?? [];
  const externalPointCloudLayers = externalState.pointCloudLayers ?? [];
  const externalImage360Layers = externalState.image360Layers ?? [];

  const cadsConsistent =
    externalCadLayers.length === models.cadModels.length &&
    externalCadLayers.every(
      (layer, index) =>
        models.cadModels[index].model.revisionId === layer.revisionId &&
        models.cadModels[index].isVisible(renderTarget) === layer.applied
    );

  const pointCloudsConsistent =
    externalPointCloudLayers.length === models.pointClouds.length &&
    externalPointCloudLayers.every(
      (layer, index) =>
        models.pointClouds[index].model.revisionId === layer.revisionId &&
        models.pointClouds[index].isVisible(renderTarget) === layer.applied
    );

  const image360sConsistent =
    externalImage360Layers.length === models.image360Collections.length &&
    (externalImage360Layers.every(
      (layer) =>
        models.image360Collections
          .find((image) => image.model.id === layer.siteId)
          ?.isVisible(renderTarget) === layer.applied
    ) ??
      false);

  return cadsConsistent && pointCloudsConsistent && image360sConsistent;
}
