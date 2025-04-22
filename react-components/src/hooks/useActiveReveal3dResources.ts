/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery } from '@tanstack/react-query';
import { use3dModels } from '../hooks/use3dModels';
import { useImage360Collections } from '../hooks/useImage360Collections';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import {
  type AddModelOptions,
  type CognitePointCloudModel,
  type DataSourceType,
  type DMDataSourceType,
  type Image360Collection,
  isDMPointCloudModel
} from '@cognite/reveal';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';
import { type LayersUrlStateParam } from '../components';
import { useMemo } from 'react';

export const useActiveReveal3dResources = (
  layerState: LayersUrlStateParam | undefined
): {
  models: AddModelOptions[];
  image360Collections: Array<Image360Collection<DataSourceType>>;
} => {
  const models = use3dModels();
  const image360Collections = useImage360Collections();
  const fdmSdk = useFdmSdk();

  const visibleModels = useMemo(() => {
    if (layerState === undefined) {
      return [];
    }
    return models.filter((m) => m.visible);
  }, [models, layerState]);

  const filteredImage360Collections = useMemo(() => {
    if (layerState === undefined) {
      return [];
    }
    return image360Collections.filter((c) => c.getIconsVisibility());
  }, [image360Collections, layerState]);

  const filteredModelsQuery = useQuery({
    queryKey: [
      'visible-3d-models',
      visibleModels.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
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

  return {
    models: filteredModelsQuery.data ?? [],
    image360Collections: filteredImage360Collections
  };
};
