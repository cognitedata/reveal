import { gql } from 'graphql-request';

export const GetMapDataQuery = gql`
  query getMapData(
    $equipmentFilter: _ListEquipmentFilter
    $roomFilter: _ListRoomFilter
  ) {
    equipment: listEquipment(first: 15, filter: $equipmentFilter) {
      items {
        externalId
        name
        type
        nodeId
        person {
          externalId
          name
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
        type
      }
    }
  }
`;
