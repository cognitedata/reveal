import { UseQueryResult } from 'react-query';

import {
  DocumentsAggregateAllUniqueValuesItem,
  ListResponse,
} from '@cognite/sdk';

type authorData = UseQueryResult<
  ListResponse<DocumentsAggregateAllUniqueValuesItem[]>,
  unknown
>;

export const getAuthorsFilter = (authorsData: authorData) => {
  return (authorsData.data?.items || [])
    .filter((item) => item.values.length > 0)
    .map((item) => {
      return {
        label: `${item.values[0]}`,
        value: item.values[0] as string,
        documentCount: item.count,
      };
    });
};
