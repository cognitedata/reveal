/*!
 * Copyright 2024 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getCadModelsForAsset } from '../hooks/network/getCadModelsForAsset';
import { getPointCloudModelsForAsset } from '../hooks/network/getPointCloudModelsForAsset';
import { useFdm3dDataProvider, useSDK } from '../components/RevealCanvas/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';
import { getImage360CollectionsForAsset } from '../hooks/network/getImage360CollectionsForAsset';
import {
  type AssetInstanceReference,
  type InstanceReference,
  isAssetInstance,
  isDmsInstance
} from '../data-providers/types';
import { uniqBy } from 'lodash';
import { createAddOptionsKey } from '../utilities/createAddOptionsKey';

export const useModelsForInstanceQuery = (
  instance: InstanceReference | undefined
): UseQueryResult<TaggedAddResourceOptions[]> => {
  const cogniteClient = useSDK();
  const fdm3dDataProvider = useFdm3dDataProvider();

  return useQuery({
    queryKey: ['reveal', 'react-components', instance],
    queryFn: async () => {
      if (instance === undefined) {
        return undefined;
      }

      if (isAssetInstance(instance)) {
        return await getModelsForAssetInstance(instance, cogniteClient);
      }

      if (isDmsInstance(instance)) {
        return fdm3dDataProvider.getCadModelsForInstance(instance);
      }
    },
    enabled: instance !== undefined
  });
};

async function getModelsForAssetInstance(
  instance: AssetInstanceReference,
  cogniteClient: CogniteClient
): Promise<TaggedAddResourceOptions[]> {
  const cadModelsPromise = getCadModelsForAsset(instance.assetId, cogniteClient);
  const pointCloudModelsPromise = getPointCloudModelsForAsset(instance.assetId, cogniteClient);
  const image360CollectionsPromise = getImage360CollectionsForAsset(
    instance.assetId,
    cogniteClient
  );

  const results = (
    await Promise.all([cadModelsPromise, pointCloudModelsPromise, image360CollectionsPromise])
  ).flat();

  return uniqBy(results, createAddOptionsKey);
}
