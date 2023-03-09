import { CogniteClient } from '@cognite/sdk';
import {
  API,
  Filter,
  RawCogniteEvent,
  RawFileInfo,
  RawTimeseries,
} from 'types/api';
import { downcaseMetadata } from 'utils';

export type ListParams = {
  cursor?: string;
  filter?: Filter;
  advancedFilter?: any;
  partition?: string;
  limit?: number;
};

export function getList(
  sdk: CogniteClient,
  api: API,
  { cursor, filter, advancedFilter, partition, limit }: ListParams
) {
  return sdk
    .post<{
      items: RawTimeseries[] | RawCogniteEvent[] | RawFileInfo[];
      nextCursor?: string;
    }>(`/api/v1/projects/${sdk.project}/${api}/list`, {
      headers: {
        'cdf-version': 'alpha',
      },
      data: {
        cursor,
        filter,
        advancedFilter,
        partition,
        limit,
      },
    })
    .then((r) => {
      if (r.status === 200) {
        return {
          nextCursor: r.data.nextCursor,
          items: r.data.items.map((item) => {
            return {
              ...item,
              // this will downcase all metadata keys. this is done since metadata aggreagates
              // are downcased server side and metadata fitlers are case insensitive
              metadata: downcaseMetadata(item.metadata),
            };
          }),
        };
      } else {
        return Promise.reject(r);
      }
    });
}
