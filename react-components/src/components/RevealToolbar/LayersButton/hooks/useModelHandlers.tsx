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
import { type LayersUrlStateParam, type ModelLayerHandlers } from '../types';
import { type UseQueryResult } from '@tanstack/react-query';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  RevealDomainObject,
  RevealRenderTarget
} from '../../../../architecture';
import { useRevealDomainObjects, useVisibleRevealDomainObjects } from '../../../../hooks';

export type UpdateModelHandlersCallback = (
  models: Array<CogniteModel<DataSourceType>>,
  image360Collections: Array<Image360Collection<DataSourceType>>
) => void;

export const useModelHandlers = (
  setExternalLayersState: Dispatch<SetStateAction<LayersUrlStateParam | undefined>> | undefined,
  viewer: Cognite3DViewer<DataSourceType>,
  models: Array<CogniteModel<DataSourceType>>,
  use3DModelName: (modelIds: number[]) => UseQueryResult<Array<string | undefined>, unknown>,
  renderTarget: RevealRenderTarget
): ModelLayerHandlers => {
  /* const image360Collections = useMemo(
    () => viewer.get360ImageCollections(),
    [viewer, viewer.get360ImageCollections().length]
  );
  const modelIds = useMemo(() => models.map((model) => model.modelId), [models]);
  const modelNames = use3DModelName(modelIds); */

  const domainObjects = useRevealDomainObjects();

  /* const [modelHandlers, setModelHandlers] = useState(
    createHandlers(models, modelNames.data, image360Collections, viewer)
  );
  useEffect(() => {
    const newHandlers = createHandlers(models, modelNames.data, image360Collections, viewer);
    setModelHandlers(newHandlers);
    }, [models, modelNames.data, image360Collections, viewer]); */

  // Plz don't commit
  const domainObjectsByVisibility = useVisibleRevealDomainObjects();
  useEffect(() => {
    setExternalLayersState?.(
      createExternalStateFromLayers(createModelLayersObject(domainObjects), renderTarget)
    );
    domainObjects.map((p) => p.isVisible(renderTarget));
  }, [domainObjectsByVisibility]);

  /* const update = useCallback(
    (
      models: Array<CogniteModel<DataSourceType>>,
      image360Collections: Array<Image360Collection<DataSourceType>>
    ) => {
      const newModelHandlers = createHandlers(models, modelNames.data, image360Collections, viewer);
      // setModelHandlers(newModelHandlers);
      const newExternalState = createExternalStateFromLayers(newModelHandlers);

      setExternalLayersState?.(newExternalState);

      viewer.requestRedraw();
    },
    [setExternalLayersState, models, modelNames.data, viewer]
    ); */

  return createModelLayersObject(domainObjects);

  /* return [
    modelHandlers,
    () => {
      update(models, viewer.get360ImageCollections());
    }
  ]; */
};

function createModelLayersObject(domainObjects: RevealDomainObject[]): ModelLayerHandlers {
  return {
    cadHandlers: domainObjects.filter((obj) => obj instanceof CadDomainObject),
    pointCloudHandlers: domainObjects.filter((obj) => obj instanceof PointCloudDomainObject),
    image360Handlers: domainObjects.filter((obj) => obj instanceof Image360CollectionDomainObject)
  };
}

/* function createHandlers(
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
} */

function createExternalStateFromLayers(
  modelHandlers: ModelLayerHandlers,
  renderTarget: RevealRenderTarget
): LayersUrlStateParam {
  return {
    cadLayers: modelHandlers.cadHandlers.map((cadHandler, handlerIndex) => ({
      applied: cadHandler.isVisible(renderTarget),
      revisionId: cadHandler.model.revisionId,
      index: handlerIndex
    })),
    pointCloudLayers: modelHandlers.pointCloudHandlers.map((pointCloudHandler, handlerIndex) => ({
      applied: pointCloudHandler.isVisible(renderTarget),
      revisionId: pointCloudHandler.model.revisionId,
      index: handlerIndex
    })),
    image360Layers: modelHandlers.image360Handlers.map((image360Handler, handlerIndex) => ({
      applied: image360Handler.isVisible(renderTarget),
      siteId: image360Handler.model.id,
      index: handlerIndex
    }))
  };
}
