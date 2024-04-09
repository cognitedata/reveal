/*!
 * Copyright 2024 Cognite AS
 */
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { type ModelLayerHandlers } from './LayersButtonsStrip';
import {
  type CogniteCadModel,
  type CogniteModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';
import { CadModelHandler, Image360CollectionHandler, PointCloudModelHandler } from './ModelHandler';
import { use3dModels } from '../../../hooks/use3dModels';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { type LayersUrlStateParam } from '../../../hooks/types';

export type UpdateModelHandlersCallback = (
  models: CogniteModel[],
  image360Collections: Image360Collection[]
) => void;

export const useModelHandlers = (
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined
): [ModelLayerHandlers, UpdateModelHandlersCallback] => {
  const models = use3dModels();
  const viewer = useReveal();
  const image360Collections = useMemo(
    () => viewer.get360ImageCollections(),
    [viewer, viewer.get360ImageCollections().length]
  );

  const [modelHandlers, setModelHandlers] = useState(createHandlers(models, image360Collections));

  useEffect(() => {
    setModelHandlers(createHandlers(models, image360Collections));
  }, [models, image360Collections]);

  const update = useCallback(
    (models: CogniteModel[], image360Collections: Image360Collection[]) => {
      const newModelHandlers = createHandlers(models, image360Collections);
      setModelHandlers(newModelHandlers);
      const newExternalState = createExternalStateFromLayers(newModelHandlers);

      setExternalLayersState?.(newExternalState);
      viewer.requestRedraw();
    },
    [setExternalLayersState, viewer]
  );

  return [modelHandlers, update];
};

function createHandlers(
  models: CogniteModel[],
  image360Collections: Image360Collection[]
): ModelLayerHandlers {
  return {
    cadHandlers: models
      .filter((model): model is CogniteCadModel => model.type === 'cad')
      .map((model) => new CadModelHandler(model)),
    pointCloudHandlers: models
      .filter((model): model is CognitePointCloudModel => model.type === 'pointcloud')
      .map((model) => new PointCloudModelHandler(model)),
    image360Handlers: image360Collections.map(
      (collection) => new Image360CollectionHandler(collection)
    )
  };
}

function createExternalStateFromLayers(modelHandlers: ModelLayerHandlers): LayersUrlStateParam {
  return {
    cadLayers: modelHandlers.cadHandlers.map((cadHandler, handlerIndex) => ({
      applied: cadHandler.visible(),
      revisionId: cadHandler.getRevisionId(),
      index: handlerIndex
    })),
    pointCloudLayers: modelHandlers.pointCloudHandlers.map((pointCloudHandler, handlerIndex) => ({
      applied: pointCloudHandler.visible(),
      revisionId: pointCloudHandler.getRevisionId(),
      index: handlerIndex
    })),
    image360Layers: modelHandlers.image360Handlers.map((image360Handler, handlerIndex) => ({
      applied: image360Handler.visible(),
      siteId: image360Handler.getSiteId(),
      index: handlerIndex
    }))
  };
}
