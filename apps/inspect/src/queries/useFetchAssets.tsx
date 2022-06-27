import { useQuery } from 'react-query';
import { CogniteClient } from '@cognite/sdk';

const assetKeys = {
  all: ['assets'] as const,
};

const doFetchAssets = ({ client }: { client: CogniteClient }) => {
  return client.assets
    .list({
      // Un comment this line to filter assets
      // filter: { source: 'test-items' },
    })
    .then((result) => result.items);
};

export const useFetchAssets = ({ client }: { client: CogniteClient }) => {
  return useQuery(assetKeys.all, () => doFetchAssets({ client }));
};
