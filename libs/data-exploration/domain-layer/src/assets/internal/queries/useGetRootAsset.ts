import { Asset } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

export const useGetRootAsset = (rootId: number) => {
  return useCdfItem<Asset>(
    'assets',
    { id: rootId },
    {
      enabled: Boolean(rootId),
    }
  );
};
