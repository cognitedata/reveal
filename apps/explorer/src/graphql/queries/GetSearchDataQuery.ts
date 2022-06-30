import { gql } from 'graphql-request';

export const GetSearchDataQuery = gql`
  query getSearchData(
    $personFilter: _ListPersonFilter
    $roomFilter: _ListRoomFilter
  ) {
    people: listPerson(first: 15, filter: $personFilter) {
      items {
        externalId
        name
        slackId
        desk {
          name
          externalId
        }
      }
    }
    rooms: listRoom(first: 15, filter: $roomFilter) {
      items {
        externalId
        name
        nodeId
        description
        isBookable
      }
    }
  }
`;
