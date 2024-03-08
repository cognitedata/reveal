/*!
 * Copyright 2024 Cognite AS
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
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
