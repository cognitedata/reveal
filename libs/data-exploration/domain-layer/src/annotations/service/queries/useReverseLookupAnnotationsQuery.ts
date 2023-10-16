import { useMemo } from 'react';

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { reverseLookupAnnotations } from '../network';
import { AnnotationReverseLookupFilterProps } from '../types';

export const useReverseLookupAnnotationsQuery = (
  {
    filter,
    limit = 100,
  }: {
    filter: AnnotationReverseLookupFilterProps;
    limit?: number;
  },
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.reverseLookupAnnotations(filter),
    ({ pageParam }) => {
      return reverseLookupAnnotations(sdk, {
        filter,
        cursor: pageParam,
        limit,
      });
    },
    {
      getNextPageParam: (param) => param.nextCursor,
      ...(options as any),
    }
  );

  const flattenData = useMemo(
    () => (data?.pages || []).flatMap(({ items }) => items),
    [data?.pages]
  );

  return { data: flattenData, ...rest };
};
