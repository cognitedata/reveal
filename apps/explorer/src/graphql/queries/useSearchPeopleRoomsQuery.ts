import { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { graphqlFetcher } from 'utils/graphqlFetcher';
import { getArrayOfItems } from 'utils/search';

import {
  SearchPeopleRoomsQueryVariables,
  _ListPersonFilter,
  _ListRoomFilter,
  SearchPeopleRoomsQueryTypeGenerated,
} from '../generated';

const SearchPeopleRoomsQuery = gql`
  query searchPeopleRooms(
    $personFilter: _ListPersonFilter
    $roomFilter: _ListRoomFilter
  ) {
    people: listPerson(first: 15, filter: $personFilter) {
      items {
        externalId
        name
        description: slackId
      }
    }
    rooms: listRoom(first: 15, filter: $roomFilter) {
      items {
        externalId
        name
        description
      }
    }
  }
`;

export const useSearchPeopleRoomsQuery = <
  TData = SearchPeopleRoomsQueryTypeGenerated,
  TError = unknown
>(
  variables?: SearchPeopleRoomsQueryVariables,
  options?: UseQueryOptions<SearchPeopleRoomsQueryTypeGenerated, TError, TData>,
  headers?: RequestInit['headers']
) => {
  const { isLoading, error, data } = useQuery<
    SearchPeopleRoomsQueryTypeGenerated,
    TError,
    TData
  >(
    variables === undefined
      ? ['searchPeopleRooms']
      : ['searchPeopleRooms', variables],
    graphqlFetcher<
      SearchPeopleRoomsQueryTypeGenerated,
      SearchPeopleRoomsQueryVariables
    >(SearchPeopleRoomsQuery, variables, headers),
    options
  );

  return { isLoading, error, data: isLoading ? [] : getArrayOfItems(data) };
};
