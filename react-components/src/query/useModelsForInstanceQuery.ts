/*!
 * Copyright 2024 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DmsUniqueIdentifier, type FdmSDK } from '../utilities/FdmSDK';
import { getCadModelsForAsset } from '../hooks/network/getCadModelsForAsset';
import { getPointCloudModelsForAsset } from '../hooks/network/getPointCloudModelsForAsset';
import { useFdmSdk, useSDK } from '../components/RevealCanvas/SDKProvider';
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type AddResourceOptions } from '../components/Reveal3DResources/types';
import { getCadModelsForFdmInstance } from '../hooks/network/getCadModelsForFdmInstance';

export type AssetInstanceReference = { assetId: number };
export type InstanceReference = AssetInstanceReference | DmsUniqueIdentifier;

export const useModelsForInstanceQuery = (
  instance: InstanceReference | undefined
): UseQueryResult<AddResourceOptions[]> => {
  const cogniteClient = useSDK();
  const fdmSdk = useFdmSdk();

  return useQuery(
    ['reveal', 'react-components', instance],
    async () => {
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
    { enabled: instance !== undefined }
  );
};

async function getModelsForAssetInstance(
  instance: AssetInstanceReference,
  cogniteClient: CogniteClient
): Promise<AddResourceOptions[]> {
  const cadModelsPromise = getCadModelsForAsset(instance.assetId, cogniteClient);
  const pointCloudModelsPromise = getPointCloudModelsForAsset(instance.assetId, cogniteClient);
  const image360CollectionsPromise = getPointCloudModelsForAsset(instance.assetId, cogniteClient);

  return (
    await Promise.all([cadModelsPromise, pointCloudModelsPromise, image360CollectionsPromise])
  ).flat();
}

async function getModelsForFdmInstance(instance: DmsUniqueIdentifier, fdmSdk: FdmSDK) {
  const cadModelsPromise = getCadModelsForFdmInstance(instance, fdmSdk);

  return await cadModelsPromise;
}

function isAssetInstance(instance: InstanceReference): instance is AssetInstanceReference {
  return 'assetId' in instance;
}

function isDmsInstance(instance: InstanceReference): instance is DmsUniqueIdentifier {
  return 'externalId' in instance && 'space' in instance;
}
