import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { useProjectConfig } from '../../../../hooks/useProjectConfig';
import { buildFilesFilter } from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';

export const useFilesSearchAggregateCountQuery = () => {
  const sdk = useSDK();
  const config = useProjectConfig();

  const [query] = useSearchQueryParams();

  const [filesFilterParams] = useDataTypeFilterParams('Files');
  const filter = useMemo(
    () => buildFilesFilter(filesFilterParams, config),
    [filesFilterParams, config]
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
