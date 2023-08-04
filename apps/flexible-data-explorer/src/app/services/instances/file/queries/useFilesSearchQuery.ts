import { useMemo } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { useProjectConfig } from '../../../../hooks/useProjectConfig';
import { buildFilesFilter } from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';

export const useFilesSearchQuery = (limit?: number) => {
  const sdk = useSDK();
  const config = useProjectConfig();

  const [query] = useSearchQueryParams();

  const [filesFilterParams] = useDataTypeFilterParams('Files');
  const filter = useMemo(
    () => buildFilesFilter(filesFilterParams, config),
    [filesFilterParams, config]
  );

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.searchFiles(query, filter, limit),
    async ({ pageParam }) => {
      const response = await sdk.documents.search({
        search: {
          query,
        },
        filter,
        limit,
        cursor: pageParam,
      });

      return response;
    },
    {
      enabled: query !== undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const flattenData = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );

  return {
    data: flattenData,
    ...rest,
  };
};
