import { useMemo } from 'react';

import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { buildFilesFilter } from '@fdx/shared/utils/filterBuilder';
import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';

export const useFilesSearchAggregateCountQuery = () => {
  const sdk = useSDK();
  const siteConfig = useSelectedSiteConfig();

  const [query] = useSearchQueryParams();

  const [filesFilterParams] = useDataTypeFilterParams('Files');
  const filter = useMemo(
    () => buildFilesFilter(filesFilterParams, siteConfig),
    [filesFilterParams, siteConfig]
  );

  return useQuery(queryKeys.aggregateFiles(query, filter as any), async () => {
    const response = await sdk.documents.aggregate.count({
      search: {
        query,
      },
      filter,
    });

    return response;
  });
};
