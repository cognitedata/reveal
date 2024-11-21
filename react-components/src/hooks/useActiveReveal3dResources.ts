/*!
 * Copyright 2024 Cognite AS
 */
import { useState, useEffect, useMemo } from 'react';
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

export const useActiveReveal3dResources = (
  layerState: LayersUrlStateParam | undefined
): {
  models: AddModelOptions[];
  image360Collections: Array<Image360Collection<DataSourceType>>;
} => {
  const models = use3dModels();
  const image360Collections = useImage360Collections();
  const fdmSdk = useFdmSdk();

  const [filteredModels, setFilteredModels] = useState<AddModelOptions[]>([]);
  const [filteredImage360Collections, setFilteredImage360Collections] = useState<
    Array<Image360Collection<DataSourceType>>
  >([]);

  const visibleModels = useMemo(() => {
    if (layerState === undefined) {
      return [];
    }
    return models.filter((m) => m.visible);
  }, [models, layerState]);

  useEffect(() => {
    const fetchFilteredModels = async (): Promise<void> => {
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

      const resolvedModels = await Promise.all(modelPromises);
      setFilteredModels(resolvedModels);
    };

    void fetchFilteredModels();
  }, [visibleModels, fdmSdk]);

  useEffect(() => {
    const visibleImage360Collections = image360Collections.filter((c) => c.getIconsVisibility());
    setFilteredImage360Collections(visibleImage360Collections);
  }, [image360Collections]);

  return useMemo(() => {
    return { models: filteredModels, image360Collections: filteredImage360Collections };
  }, [filteredModels, filteredImage360Collections]);
};
