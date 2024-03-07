import { use3dModels, useReveal } from '../../..';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModelLayerHandlers } from './LayersButtonsStrip';
import {
  CogniteCadModel,
  CogniteModel,
  CognitePointCloudModel,
  Image360Collection
} from '@cognite/reveal';
import { CadModelHandler, Image360CollectionHandler, PointCloudModelHandler } from './ModelHandler';

export const useModelHandlers = (): [ModelLayerHandlers, () => void] => {
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

  const update = useCallback(() => {
    setModelHandlers(createHandlers(models, image360Collections));
    viewer.requestRedraw();
  }, [models, image360Collections]);

  return [modelHandlers, update];
};

function createHandlers(models: CogniteModel[], image360Collections: Image360Collection[]) {
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
