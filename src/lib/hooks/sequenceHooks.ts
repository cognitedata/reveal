import { useSDK } from '@cognite/sdk-provider';

import {
  CogniteClient,
  IdEither,
  SequenceColumn,
  SequenceItem,
} from '@cognite/sdk';
// eslint-disable-next-line
import { SequenceRow } from '@cognite/sdk/dist/src/api/sequences/sequenceRow'; //
import { pickOptionalId } from 'lib/utils/idUtils';

import { InfiniteQueryConfig, useInfiniteQuery } from 'react-query';

const post = <T>(sdk: CogniteClient, path: string, data: any) =>
  sdk
    .post(`/api/v1/projects/${sdk.project}${path}`, { data })
    .then(response => response.data as T);

// refactor into the sdq-query-library
export const useInfiniteSequenceRows = (
  id?: IdEither,
  limit?: number,
  config?: InfiniteQueryConfig<SequenceDataResponse>
) => {
  const realLimit = limit || 200;
  const sdk = useSDK();

  return useInfiniteQuery<SequenceDataResponse>(
    `sequence-rows-${pickOptionalId(id)}`,
    async (_: string, nextCursor?: string) => {
      const res = await post<SequenceDataResponse>(
        sdk,
        `/sequences/data/list`,
        {
          ...id,
          limit: realLimit,
          cursor: nextCursor,
        }
      );
      return res;
    },
    { getFetchMore: r => r?.nextCursor, ...config }
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
