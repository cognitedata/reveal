import { gql } from 'graphql-request';

export const ListEquipmentForRoom = gql`
  query listEquipmentForRoom($equipmentFilter: _ListEquipmentFilter) {
    equipment: listEquipment(filter: $equipmentFilter) {
      items {
        externalId
        name
        type
        nodeId
        isBroken
        person {
          externalId
          name
        }
      }
    }
  }
`;
