import { gql } from 'graphql-request';

export const ListPeopleWithNoDeskQuery = gql`
  query listPeopleWithNoDesk {
    people: listPerson(filter: { desk: { externalId: { isNull: true } } }) {
      items {
        externalId
        name
      }
    }
  }
`;
