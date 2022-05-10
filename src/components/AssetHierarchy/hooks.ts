import { IdEither } from '@cognite/sdk-core/dist/src';
import { useSDK } from '@cognite/sdk-provider';
import {
  AssetRetrieveParams,
  Asset,
  AssetListScope,
  ListResponse,
} from '@cognite/sdk';
import { useQuery } from 'react-query';

export const useAssetBreadcrumbsQuery = (
  assetId?: IdEither,
  assetRetrieveParams?: AssetRetrieveParams
) => {
  const sdk = useSDK();
  return useQuery<Asset[] | null>(
    ['assetBreadcrumbQuery', assetId],
    async () => {
      if (!assetId) {
        return null;
      }

      const hierarchy = [];
      // fetch current asset
      let [nextAsset] = await sdk.assets.retrieve(
        [assetId],
        assetRetrieveParams
      );
      hierarchy.push(nextAsset);
      let { parentId: nextParentId } = nextAsset;

      while (nextParentId) {
        // fetch next parent asset
        // eslint-disable-next-line no-await-in-loop
        [nextAsset] = await sdk.assets.retrieve(
          [{ id: nextParentId }],
          assetRetrieveParams
        );
        hierarchy.push(nextAsset);
        ({ parentId: nextParentId } = nextAsset);
      }
      return hierarchy;
    },
    {
      enabled: Boolean(assetId),
    }
  );
};

export const useAssetRetrieveQuery = (
  assetIds: IdEither[] | undefined,
  assetRetrieveParams?: AssetRetrieveParams
) => {
  const sdk = useSDK();
  return useQuery<Asset[]>(
    ['assetRetrieve', assetIds, assetRetrieveParams],
    () =>
      sdk.assets.retrieve(assetIds as IdEither[], assetRetrieveParams || {}),
    {
      enabled: Boolean(assetIds),
    }
  );
};

export const useAssetListQuery = (params?: AssetListScope) => {
  const sdk = useSDK();
  return useQuery<ListResponse<Asset[]>>(
    ['assetList', params],
    () => sdk.assets.list(params),
    {
      enabled: Boolean(params),
    }
  );
};
