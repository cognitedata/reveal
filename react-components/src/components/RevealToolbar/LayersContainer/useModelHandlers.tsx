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
  type Cognite3DViewer,
  type CogniteCadModel,
  type CogniteModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';
import { CadModelHandler, Image360CollectionHandler, PointCloudModelHandler } from './ModelHandler';
import { use3dModels } from '../../../hooks/use3dModels';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { type LayersUrlStateParam } from '../../../hooks/types';
import { use3DModelName } from '../../../query/use3DModelName';

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

  const modelIds = useMemo(() => models.map((model) => model.modelId), [models]);
  const modelNames = use3DModelName(modelIds);

  const [modelHandlers, setModelHandlers] = useState(
    createHandlers(models, modelNames.data, image360Collections, viewer)
  );

  useEffect(() => {
    setModelHandlers(createHandlers(models, modelNames.data, image360Collections, viewer));
  }, [models, modelNames.data, image360Collections, viewer]);

  const update = useCallback(
    (models: CogniteModel[], image360Collections: Image360Collection[]) => {
      const newModelHandlers = createHandlers(models, modelNames.data, image360Collections, viewer);
      setModelHandlers(newModelHandlers);
      const newExternalState = createExternalStateFromLayers(newModelHandlers);

      setExternalLayersState?.(newExternalState);
      viewer.requestRedraw();
    },
    [setExternalLayersState, models, modelNames.data]
  );

  return [modelHandlers, update];
};

function createHandlers(
  models: CogniteModel[],
  modelNames: string[] | undefined,
  image360Collections: Image360Collection[],
  viewer: Cognite3DViewer
): ModelLayerHandlers {
  const is360CollectionCurrentlyEntered = (collection: Image360Collection): boolean =>
    viewer.getActive360ImageInfo()?.image360Collection === collection;
  const exit360Image = (): void => {
    viewer.exit360Image();
  };

  return {
    cadHandlers: models
      .map((model, index) => [index, model] as const)
      .filter(
        (modelWithIndex): modelWithIndex is [number, CogniteCadModel] =>
          modelWithIndex[1].type === 'cad'
      )
      .map(
        (modelWithIndex) => new CadModelHandler(modelWithIndex[1], modelNames?.[modelWithIndex[0]])
      ),
    pointCloudHandlers: models
      .map((model, index) => [index, model] as const)
      .filter(
        (modelWithIndex): modelWithIndex is [number, CognitePointCloudModel] =>
          modelWithIndex[1].type === 'pointcloud'
      )
      .map(
        (modelWithIndex) =>
          new PointCloudModelHandler(modelWithIndex[1], modelNames?.[modelWithIndex[0]])
      ),
    image360Handlers: image360Collections.map(
      (collection) =>
        new Image360CollectionHandler(collection, is360CollectionCurrentlyEntered, exit360Image)
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
