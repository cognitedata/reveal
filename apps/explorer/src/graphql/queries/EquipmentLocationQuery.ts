import { gql } from 'graphql-request';

export const EquipmentLocation = gql`
  query equipmentLocation {
    equipment: listEquipment {
      items {
        type
        room {
          externalId
        }
      }
    }
  }
`;
