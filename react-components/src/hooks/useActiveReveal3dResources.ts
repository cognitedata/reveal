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
import { createContext, useContext, useMemo } from 'react';
import { EMPTY_ARRAY } from '../utilities/constants';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { isDefined } from '../utilities/isDefined';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { useVisibleRevealDomainObjects } from './useVisibleRevealDomainObjects';

export type UseActiveReveal3dResourcesDependencies = {
  useVisibleRevealDomainObjects: typeof useVisibleRevealDomainObjects;
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUseActiveReveal3dResourcesDependencies = {
  useVisibleRevealDomainObjects,
  useFdmSdk
};

export const UseActiveReveal3dResourcesContext =
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
    queryKey: ['visible-3d-models', visibleModels.map(getModelIdentifier).sort()],
    queryFn: async () => {
      const modelPromises = visibleModels.map(async (model) => {
        if (model.type === 'pointcloud' && isDMPointCloudModel(model as CognitePointCloudModel)) {
          const pointCloudModel = model as CognitePointCloudModel<DMDataSourceType>;
          const { modelId, revisionId } = await getModelIdAndRevisionIdFromExternalId(
            pointCloudModel.modelIdentifier.revisionExternalId,
            pointCloudModel.modelIdentifier.revisionSpace,
            fdmSdk
          );
          return {
            modelId,
            revisionId
          };
        }

        return {
          modelId: model.modelId,
          revisionId: model.revisionId
        };
      });

      return await Promise.all(modelPromises);
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

function getModelIdentifier(model: CogniteModel<DataSourceType>): string {
  if (model instanceof CognitePointCloudModel && isDMPointCloudModel(model)) {
    return `${model.modelIdentifier.revisionExternalId}/${model.modelIdentifier.revisionExternalId}`;
  } else {
    return `${model.modelId}/${model.revisionId}`;
  }
}
