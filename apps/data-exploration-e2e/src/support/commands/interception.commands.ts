import { Interception } from 'cypress/types/net-stubbing';

type Order = 'asc' | 'desc';

const shouldSort = (
  { request }: Interception,
  property: string,
  order: Order
) => {
  expect(request.body.sort[0]).to.deep.include({
    property: [property],
    order,
  });
};

const shouldSortAscending = (interception: Interception, property: string) => {
  cy.wrap(interception).shouldSort(property, 'asc');
};

const shouldSortDescending = (interception: Interception, property: string) => {
  cy.wrap(interception).shouldSort(property, 'desc');
};

Cypress.Commands.add('shouldSort', { prevSubject: true }, shouldSort);
Cypress.Commands.add(
  'shouldSortAscending',
  { prevSubject: true },
  shouldSortAscending
);
Cypress.Commands.add(
  'shouldSortDescending',
  { prevSubject: true },
  shouldSortDescending
);

export interface InterceptionCommands {
  shouldSort: (property: string, order: Order) => void;
  shouldSortAscending: (property: string) => void;
  shouldSortDescending: (property: string) => void;
}
