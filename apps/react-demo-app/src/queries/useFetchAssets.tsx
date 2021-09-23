import { CogniteClient } from '@cognite/sdk';
import { useQuery } from 'react-query';

const assetKeys = {
  all: ['assets'] as const,
};

const doFetchAssets = ({ client }: { client: CogniteClient }) => {
  return client.assets
    .list({
      filter: { source: 'test-items' },
    })
    .then((result) => result.items);
};

export const useFetchAssets = ({ client }: { client: CogniteClient }) => {
  return useQuery(assetKeys.all, () => doFetchAssets({ client }));
};
