import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { BASE_QUERY_KEY } from '@transformations/common';

import { Sequence } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

export const useSequences = (
  options?: UseQueryOptions<
    Sequence[],
    unknown,
    Sequence[],
    (string | number)[]
  >
) => {
  const sdk = useSDK();

  return useQuery<Sequence[], unknown, Sequence[], (string | number)[]>(
    [BASE_QUERY_KEY, 'sequences', 1000],
    () => sdk.sequences.list({ limit: 1000 }).then((res) => res.items),
    options
  );
};
