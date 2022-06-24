import {
  SearchPeopleRoomsQueryTypeGenerated,
  useSearchPeopleRoomsQuery,
} from 'graphql/generated';
import { useQueryClient } from 'react-query';

export const usePersonSelector = ({ externalId }: { externalId?: string }) => {
  const queryClient = useQueryClient();
  const searchQueryKey = useSearchPeopleRoomsQuery.getKey();
  const cachedData =
    queryClient.getQueryData<SearchPeopleRoomsQueryTypeGenerated>(
      searchQueryKey
    ) || {};

  return cachedData?.people?.items.find(
    (person) => person?.externalId === externalId
  );
};
