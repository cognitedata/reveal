import { useContext } from 'react';
import { useQuery } from 'react-query';
import {
  Asset,
  AssetListScope,
  AssetRetrieveParams,
  AssetSearchFilter,
  IdEither,
  CogniteClient,
  ListResponse,
} from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

export const useAssetSearchQuery = (assetQuery?: AssetSearchFilter) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<Asset[]>(
    ['assetSearch', assetQuery],
    () => client.assets.search(assetQuery || {}),
    {
      enabled: Boolean(assetQuery),
    }
  );
  return query;
};

const retrieveParentAssets = async (
  client: CogniteClient,
  assetId?: IdEither
) => {
  if (!assetId) return null;
  const hierarchy = [];
  // fetch current asset
  let [nextAsset] = await client.assets.retrieve([assetId]);
  hierarchy.push(nextAsset);
  let { parentId: nextParentId } = nextAsset;

  while (nextParentId) {
    // fetch next parent asset
    // eslint-disable-next-line no-await-in-loop
    [nextAsset] = await client.assets.retrieve([{ id: nextParentId }]);
    hierarchy.push(nextAsset);
    ({ parentId: nextParentId } = nextAsset);
  }
  return hierarchy;
};

export const useAssetBreadcrumbsQuery = (assetId?: IdEither) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<Asset[] | null>(
    ['assetBreadcrumbQuery', assetId],
    () => retrieveParentAssets(client, assetId),
    {
      enabled: Boolean(assetId),
    }
  );
  return query;
};

export const useAssetRetrieveQuery = (
  assetIds: IdEither[] | undefined,
  assetRetrieveParams?: AssetRetrieveParams
) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<Asset[]>(
    ['assetRetrieve', assetIds, assetRetrieveParams],
    () =>
      client.assets.retrieve(assetIds as IdEither[], assetRetrieveParams || {}),
    {
      enabled: Boolean(assetIds),
    }
  );
  return query;
};

export const useAssetListQuery = (params?: AssetListScope) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<ListResponse<Asset[]>>(
    ['assetList', params],
    () => client.assets.list(params),
    {
      enabled: Boolean(params),
    }
  );
  return query;
};
