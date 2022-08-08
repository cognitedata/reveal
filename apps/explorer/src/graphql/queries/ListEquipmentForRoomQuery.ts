import { gql } from 'graphql-request';

export const ListFilteredEquipment = gql`
  query ListFilteredEquipment($equipmentFilter: _ListEquipmentFilter) {
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
