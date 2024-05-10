/*!
 * Copyright 2024 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DmsUniqueIdentifier, type FdmSDK } from '../utilities/FdmSDK';
import { getCadModelsForAsset } from '../hooks/network/getCadModelsForAsset';
import { getPointCloudModelsForAsset } from '../hooks/network/getPointCloudModelsForAsset';
import { useFdmSdk, useSDK } from '../components/RevealCanvas/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';
import { getCadModelsForFdmInstance } from '../hooks/network/getCadModelsForFdmInstance';
import { getImage360CollectionsForAsset } from '../hooks/network/getImage360CollectionsForAsset';
import {
  type AssetInstanceReference,
  type InstanceReference,
  isAssetInstance,
  isDmsInstance
} from '../utilities/types';

export const useModelsForInstanceQuery = (
  instance: InstanceReference | undefined
): UseQueryResult<TaggedAddResourceOptions[]> => {
  const cogniteClient = useSDK();
  const fdmSdk = useFdmSdk();

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
        return await getModelsForFdmInstance(instance, fdmSdk);
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

  return (
    await Promise.all([cadModelsPromise, pointCloudModelsPromise, image360CollectionsPromise])
  ).flat();
}

async function getModelsForFdmInstance(
  instance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK
): Promise<TaggedAddResourceOptions[]> {
  const cadModelsPromise = getCadModelsForFdmInstance(instance, fdmSdk);

  return await cadModelsPromise;
}
