import {
  SearchPeopleRoomsQueryTypeGenerated,
  useSearchPeopleRoomsQuery,
} from 'graphql/generated';

export const useGetDestData = (urlSearchParams: URLSearchParams) => {
  const { data, error } = useSearchPeopleRoomsQuery();
  if (error) return undefined;

  const destId = urlSearchParams.get('to');
  const destType = urlSearchParams.get(
    'toType'
  ) as keyof SearchPeopleRoomsQueryTypeGenerated;
  const destData =
    data && data[destType]?.items.find((item) => item?.externalId === destId);

  return destData;
};
