import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '../utilities/queryKeys';
import { type DmsUniqueIdentifier, type FdmNode, type Source } from '../data-providers/FdmSDK';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';

export const useDmInstancesByIds = (
  ids: DmsUniqueIdentifier[],
  sources: Source[]
): UseQueryResult<Array<FdmNode<Record<string, any>>>> => {
  const fdmSdk = useFdmSdk();
  return useQuery({
    queryKey: queryKeys.dmNodesById(ids),
    queryFn: async () => {
      if (ids.length === 0) {
        return [];
      }

      const res = await fdmSdk.getByExternalIds(
        ids.map((id) => ({ ...id, instanceType: 'node' })),
        sources
      );
      return res.items;
    },
    enabled: ids.length > 0
  });
};
