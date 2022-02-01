import { useContext } from 'react';
import { useQuery } from 'react-query';
import {
  Asset,
  AssetListScope,
  AssetRetrieveParams,
  AssetSearchFilter,
  IdEither,
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
