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
import {
  type DataSourceType,
  type Cognite3DViewer,
  type CogniteCadModel,
  type CogniteModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';
import {
  CadModelHandler,
  Image360CollectionHandler,
  PointCloudModelHandler
} from '../ModelHandler';
import { use3dModels } from '../../../../hooks/use3dModels';
import { useReveal } from '../../../RevealCanvas/ViewerContext';
import {
  type DefaultLayersConfiguration,
  type LayersUrlStateParam,
  type ModelLayerHandlers
} from '../types';
import { use3DModelName } from '../../../../query/use3DModelName';

export type UpdateModelHandlersCallback = (
  models: Array<CogniteModel<DataSourceType>>,
  image360Collections: Array<Image360Collection<DataSourceType>>
) => void;

export const useModelHandlers = (
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  defaultLayersConfig: DefaultLayersConfiguration | undefined
): [ModelLayerHandlers, () => void] => {
  const viewer = useReveal();
  const models = use3dModels();
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
    const newHandlers = createHandlers(models, modelNames.data, image360Collections, viewer);
    setDefaultConfigOnNewHandlers(newHandlers, modelHandlers, defaultLayersConfig);
    setModelHandlers(newHandlers);
  }, [models, modelNames.data, image360Collections, viewer]);

  const update = useCallback(
    (
      models: Array<CogniteModel<DataSourceType>>,
      image360Collections: Array<Image360Collection<DataSourceType>>
    ) => {
      const newModelHandlers = createHandlers(models, modelNames.data, image360Collections, viewer);
      setModelHandlers(newModelHandlers);
      const newExternalState = createExternalStateFromLayers(newModelHandlers);

      setExternalLayersState?.(newExternalState);
      viewer.requestRedraw();
    },
    [setExternalLayersState, models, modelNames.data, viewer]
  );

  return [
    modelHandlers,
    () => {
      update(models, viewer.get360ImageCollections());
    }
  ];
};

function createHandlers(
  models: Array<CogniteModel<DataSourceType>>,
  modelNames: Array<string | undefined> | undefined,
  image360Collections: Array<Image360Collection<DataSourceType>>,
  viewer: Cognite3DViewer<DataSourceType>
): ModelLayerHandlers {
  const is360CollectionCurrentlyEntered = (
    collection: Image360Collection<DataSourceType>
  ): boolean => viewer.getActive360ImageInfo()?.image360Collection === collection;
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

function setDefaultConfigOnNewHandlers(
  newHandlers: ModelLayerHandlers,
  modelHandlers: ModelLayerHandlers,
  defaultLayersConfig: DefaultLayersConfiguration | undefined
): void {
  const containsCadModel = newHandlers.cadHandlers.length > 0;
  const containsPointCloudModel = newHandlers.pointCloudHandlers.length > 0;
  newHandlers.cadHandlers.forEach((newHandler) => {
    if (!modelHandlers.cadHandlers.some((oldHandler) => oldHandler.isSame(newHandler))) {
      newHandler.setVisibility(defaultLayersConfig?.cad ?? true);
    }
  });

  newHandlers.pointCloudHandlers.forEach((newHandler) => {
    if (!modelHandlers.pointCloudHandlers.some((oldHandler) => oldHandler.isSame(newHandler))) {
      newHandler.setVisibility(containsCadModel ? (defaultLayersConfig?.pointcloud ?? true) : true);
    }
  });

  newHandlers.image360Handlers.forEach((newHandler) => {
    if (!modelHandlers.image360Handlers.some((oldHandler) => oldHandler.isSame(newHandler))) {
      if (!containsCadModel && !containsPointCloudModel) {
        newHandler.setVisibility(true);
      } else {
        newHandler.setVisibility(defaultLayersConfig?.image360 ?? true);
      }
    }
  });
}
