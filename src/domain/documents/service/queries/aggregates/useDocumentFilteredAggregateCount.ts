import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from 'domain/queryKeys';
import { InternalDocumentFilter } from 'domain/documents';
import { useQuery } from 'react-query';
import { getDocumentAggregateCount } from '../../network/getDocumentAggregateCount';

export const useDocumentFilteredAggregateCount = ({
  filters,
  query,
}: {
  filters?: InternalDocumentFilter;
  query?: string;
}) => {
  const sdk = useSDK();

  return useQuery(queryKeys.documentsFilterAggregateCount(filters), () => {
    return getDocumentAggregateCount(
      {
        ...filters,
        ...(query ? { search: { query } } : {}),
      },
      sdk
    );
  });
};
