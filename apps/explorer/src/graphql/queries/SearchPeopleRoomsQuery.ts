import { gql } from 'graphql-request';

export const SearchPeopleRoomsQuery = gql`
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
        nodeId
        description
      }
    }
  }
`;
