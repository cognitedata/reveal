import { useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import {
  type AddModelOptions,
  type CogniteModel,
  CognitePointCloudModel,
  type DataSourceType,
  type DMDataSourceType,
  type Image360Collection,
  isDMPointCloudModel
} from '@cognite/reveal';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';
import { type LayersUrlStateParam } from '../components/RevealToolbar/LayersButton/types';
import { type Context, createContext, useContext, useMemo } from 'react';
import { EMPTY_ARRAY } from '../utilities/constants';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { isDefined } from '../utilities/isDefined';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { useVisibleRevealDomainObjects } from './useVisibleRevealDomainObjects';
import { type FdmSDK } from '../data-providers/FdmSDK';

export type UseActiveReveal3dResourcesDependencies = {
  useVisibleRevealDomainObjects: typeof useVisibleRevealDomainObjects;
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUseActiveReveal3dResourcesDependencies: {
  useVisibleRevealDomainObjects: typeof useVisibleRevealDomainObjects;
  useFdmSdk: () => FdmSDK;
} = {
  useVisibleRevealDomainObjects,
  useFdmSdk
};

export const UseActiveReveal3dResourcesContext: Context<UseActiveReveal3dResourcesDependencies> =
  createContext<UseActiveReveal3dResourcesDependencies>(
    defaultUseActiveReveal3dResourcesDependencies
  );

export const useActiveReveal3dResources = (
  layerState: LayersUrlStateParam | undefined
): {
  models: AddModelOptions[];
  image360Collections: Array<Image360Collection<DataSourceType>>;
} => {
  const { useVisibleRevealDomainObjects, useFdmSdk } = useContext(
    UseActiveReveal3dResourcesContext
  );

  const visibleDomainObjects = useVisibleRevealDomainObjects();
  const fdmSdk = useFdmSdk();

  const visibleModels = useMemo(() => {
    if (layerState === undefined) {
      return EMPTY_ARRAY;
    }

    return visibleDomainObjects
      .filter(
        (domainObject) =>
          domainObject instanceof PointCloudDomainObject || domainObject instanceof CadDomainObject
      )
      .map((domainObject) => domainObject.model)
      .filter(isDefined);
  }, [visibleDomainObjects, layerState]);

  const visibleImage360Collections = useMemo(() => {
    if (layerState === undefined) {
      return EMPTY_ARRAY;
    }
    return visibleDomainObjects
      .filter((domainObject) => domainObject instanceof Image360CollectionDomainObject)
      .map((domainObject) => domainObject.model)
      .filter(isDefined);
  }, [visibleDomainObjects, layerState]);

  const filteredModelsQuery = useQuery({
    queryKey: ['visible-3d-models', visibleModels.map(getModelIdentifierKey).sort()],
    queryFn: async () => {
      const modelPromises = visibleModels.map(async (model) => {
        if (model.type === 'pointcloud' && isDMPointCloudModel(model as CognitePointCloudModel)) {
          const pointCloudModel = model as CognitePointCloudModel<DMDataSourceType>;
          return await getModelIdAndRevisionIdFromExternalId(
            pointCloudModel.modelIdentifier.revisionExternalId,
            pointCloudModel.modelIdentifier.revisionSpace,
            fdmSdk
          );
        }

        return {
          modelId: model.modelId,
          revisionId: model.revisionId
        };
      });

      const modelResults = await Promise.allSettled(modelPromises);

      return modelResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
    },
    enabled: visibleModels.length > 0,
    staleTime: Infinity
  });

  return useMemo(
    () => ({
      models: filteredModelsQuery.data ?? EMPTY_ARRAY,
      image360Collections: visibleImage360Collections
    }),
    [filteredModelsQuery.data, visibleImage360Collections]
  );
};

function getModelIdentifierKey(model: CogniteModel<DataSourceType>): string {
  if (model instanceof CognitePointCloudModel && isDMPointCloudModel(model)) {
    return `${model.modelIdentifier.revisionExternalId}/${model.modelIdentifier.revisionSpace}`;
  } else {
    return `${model.modelId}/${model.revisionId}`;
  }
}
