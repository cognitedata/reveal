import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type InternalId, type CogniteClient } from '@cognite/sdk';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';
import { uniqBy } from 'lodash-es';
import { createAddOptionsKey } from '../utilities/createAddOptionsKey';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { type InstanceReference, isDmsInstance, isInternalId } from '../utilities/instanceIds';
import { useContext } from 'react';
import { UseModelsForInstanceQueryContext } from './useModelsForInstanceQuery.context';
import { type ModelsForAssetParams } from '../hooks/network/types';
import { queryKeys } from '../utilities/queryKeys';

export const useModelsForInstanceQuery = (
  instance: InstanceReference | undefined
): UseQueryResult<TaggedAddResourceOptions[] | null> => {
  const {
    useSDK,
    useFdmSdk,
    useFdm3dDataProvider,
    useIsCoreDmOnly,
    getPointCloudModelsForAssetInstance,
    getCadModelsForHybridDmInstance,
    getCadModelsForAsset,
    getPointCloudModelsForAsset,
    getImage360CollectionsForAsset
  } = useContext(UseModelsForInstanceQueryContext);

  const cogniteClient = useSDK();
  const fdm3dDataProvider = useFdm3dDataProvider();
  const fdmSdk = useFdmSdk();
  const isCoreDm = useIsCoreDmOnly();

  return useQuery({
    queryKey: queryKeys.modelsForAssetPerInstanceReference(instance),
    queryFn: async () => {
      if (instance === undefined) {
        return null;
      }

      if (isInternalId(instance)) {
        return await getModelsForAssetInstance(
          instance,
          cogniteClient,
          getCadModelsForAsset,
          getPointCloudModelsForAsset,
          getImage360CollectionsForAsset
        );
      }

      if (isDmsInstance(instance)) {
        if (!isCoreDm) {
          return await getCadModelsForHybridDmInstance(instance, cogniteClient);
        }
        if (fdm3dDataProvider === undefined) {
          return [];
        }
        return await getModelsForDmsInstance(
          instance,
          fdmSdk,
          fdm3dDataProvider,
          getPointCloudModelsForAssetInstance
        );
      }

      throw Error(
        `Can not fetch models for instance: ${JSON.stringify(instance)}. InternalId or DMS ID required`
      );
    },
    enabled: instance !== undefined,
    staleTime: Infinity
  });
};

async function getModelsForAssetInstance(
  instance: InternalId,
  sdk: CogniteClient,
  getCadModelsForAsset: ({
    assetId,
    sdk
  }: ModelsForAssetParams) => Promise<TaggedAddResourceOptions[]>,
  getPointCloudModelsForAsset: ({
    assetId,
    sdk
  }: ModelsForAssetParams) => Promise<TaggedAddResourceOptions[]>,
  getImage360CollectionsForAsset: ({
    assetId,
    sdk
  }: ModelsForAssetParams) => Promise<TaggedAddResourceOptions[]>
): Promise<TaggedAddResourceOptions[]> {
  const cadModelsPromise = getCadModelsForAsset({ assetId: instance.id, sdk });
  const pointCloudModelsPromise = getPointCloudModelsForAsset({ assetId: instance.id, sdk });
  const image360CollectionsPromise = getImage360CollectionsForAsset({ assetId: instance.id, sdk });

  const results = (
    await Promise.all([cadModelsPromise, pointCloudModelsPromise, image360CollectionsPromise])
  ).flat();

  return uniqBy(results, createAddOptionsKey);
}

async function getModelsForDmsInstance(
  instance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK,
  fdm3dDataProvider: Fdm3dDataProvider,
  getPointCloudModelsForAssetInstance: (
    instance: DmsUniqueIdentifier,
    sdk: FdmSDK
  ) => Promise<TaggedAddResourceOptions[]>
): Promise<TaggedAddResourceOptions[]> {
  const cadModelsPromise = fdm3dDataProvider.getCadModelsForInstance(instance);
  const pointCloudModelsPromise = getPointCloudModelsForAssetInstance(instance, fdmSdk);

  const results = (await Promise.all([cadModelsPromise, pointCloudModelsPromise])).flat();

  return uniqBy(results, createAddOptionsKey);
}
