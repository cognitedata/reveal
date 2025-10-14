import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { type LayersUrlStateParam, type ModelLayerContent } from '../types';
import { updateExternalStateFromLayerContent } from '../updateExternalStateFromLayerContent';
import { updateViewerFromExternalState } from '../updateViewerFromExternalState';
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
    if (areLayerStatesConsistent(modelLayerContent, externalLayersState, renderTarget)) {
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
  externalState: LayersUrlStateParam | undefined,
  renderTarget: RevealRenderTarget
): boolean {
  if (externalState === undefined) {
    return (
      models.cadModels.length === 0 &&
      models.pointClouds.length === 0 &&
      models.image360Collections.length === 0
    );
  }

  const cadsConsistent =
    externalState.cadLayers?.length === models.cadModels.length &&
    (externalState.cadLayers?.every(
      (layer, index) =>
        models.cadModels[index].model.revisionId === layer.revisionId &&
        models.cadModels[index].isVisible(renderTarget) === layer.applied
    ) ??
      false);

  const pointCloudsConsistent =
    externalState.pointCloudLayers?.length === models.pointClouds.length &&
    (externalState.pointCloudLayers?.every(
      (layer, index) =>
        models.pointClouds[index].model.revisionId === layer.revisionId &&
        models.pointClouds[index].isVisible(renderTarget) === layer.applied
    ) ??
      false);

  const image360sConsistent =
    externalState.image360Layers?.length === models.image360Collections.length &&
    (externalState.image360Layers?.every(
      (layer) =>
        models.image360Collections
          .find((image) => image.model.id === layer.siteId)
          ?.isVisible(renderTarget) === layer.applied
    ) ??
      false);

  return cadsConsistent && pointCloudsConsistent && image360sConsistent;
}
