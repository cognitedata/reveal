import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from 'app/domain/queryKeys';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import { getEventsList } from '../network/getEventsList';

export const useEventsListQuery = (advancedFilter?: any) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.event(advancedFilter),
    ({ pageParam }) => {
      return getEventsList(sdk, { cursor: pageParam, advancedFilter });
    },
    {
      getNextPageParam: param => param.nextCursor,
    }
  );

  const flattenData = useMemo(
    () => (data?.pages || []).flatMap(({ items }) => items),
    [data?.pages]
  );

  return { data: flattenData, ...rest };
};
