import {
  GetSearchDataQueryTypeGenerated,
  useGetSearchDataQuery,
} from 'graphql/generated';
import { useQueryClient } from 'react-query';

export const usePersonSelector = ({ externalId }: { externalId?: string }) => {
  const queryClient = useQueryClient();
  const searchQueryKey = useGetSearchDataQuery.getKey();
  const cachedData =
    queryClient.getQueryData<GetSearchDataQueryTypeGenerated>(searchQueryKey) ||
    {};

  return cachedData?.people?.items.find(
    (person) => person?.externalId === externalId
  );
};
