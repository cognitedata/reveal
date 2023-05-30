import {
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';

import {
  CogniteClient,
  IdEither,
  SequenceColumn,
  SequenceItem,
  SequenceRow,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { pickOptionalId } from '@data-exploration-lib/core';

const post = <T>(sdk: CogniteClient, path: string, data: any) =>
  sdk
    .post(`/api/v1/projects/${sdk.project}${path}`, { data })
    .then((response) => response.data as T);

// refactor into the sdq-query-library
export const useInfiniteSequenceRows = (
  id?: IdEither,
  limit?: number,
  config?: UseInfiniteQueryOptions<SequenceDataResponse>
) => {
  const realLimit = limit || 200;
  const sdk = useSDK();

  return useInfiniteQuery<SequenceDataResponse>(
    [`sequence-rows-${pickOptionalId(id)}`],
    async ({ pageParam }) => {
      const res = await post<SequenceDataResponse>(
        sdk,
        `/sequences/data/list`,
        {
          ...id,
          limit: realLimit,
          cursor: pageParam,
        }
      );
      return res;
    },
    { getNextPageParam: (r: any) => r?.nextCursor, ...config }
  );
};

export type SequenceRowDTO = SequenceRow & {
  values: SequenceItem[];
};

type SequenceDataResponse = {
  columns: SequenceColumn[];
  rows: SequenceRowDTO[];
  externalId?: string;
  id?: number;
  nextCursor?: string;
};
