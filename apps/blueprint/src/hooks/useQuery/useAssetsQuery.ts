import uniq from 'lodash/uniq';
import { AuthContext } from 'providers/AuthProvider';
import { useContext } from 'react';
import { useQuery } from 'react-query';

export const useAssetsQuery = (assetIds: (string | undefined)[]) => {
  const { client } = useContext(AuthContext);
  return useQuery(
    ['asset-query', assetIds],
    () => {
      return client.assets.retrieve(
        uniq(assetIds)
          .filter(Boolean)
          .map((x) => ({ id: Number(x) }))
      );
    },
    { enabled: assetIds.length > 0 }
  );
};

export const useAssetExternalIdsQuery = (assetExternalIds: string[]) => {
  const { client } = useContext(AuthContext);
  return useQuery(
    ['asset-exids-query', assetExternalIds],
    () => {
      return client.assets.retrieve(
        uniq(assetExternalIds)
          .filter(Boolean)
          .map((x) => ({ externalId: x }))
      );
    },
    { enabled: assetExternalIds.length > 0 }
  );
};
