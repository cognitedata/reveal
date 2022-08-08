import { gql } from 'graphql-request';

export const ListPeopleWithNoEquipmentQuery = gql`
  query listPeopleWithNoEquipment {
    people: listPerson(filter: { desk: { externalId: { isNull: true } } }) {
      items {
        externalId
        name
      }
    }
  }
`;
