import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { useSelectedSiteConfig } from '../../../../hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { buildFilesFilter } from '../../../../utils/filterBuilder';
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
