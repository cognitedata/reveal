import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { buildFilesFilter } from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';

export const useFilesSearchAggregateCountQuery = () => {
  const sdk = useSDK();
  const [query] = useSearchQueryParams();

  const [filesFilterParams] = useDataTypeFilterParams('Files');

  return useQuery(
    queryKeys.aggregateFiles(query, filesFilterParams as any),
    async () => {
      const response = await sdk.documents.aggregate.count({
        search: {
          query,
        },
        filter: buildFilesFilter(filesFilterParams),
      });

      return response;
    }
  );
};
