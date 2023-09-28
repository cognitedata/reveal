import { get } from 'cypress/types/lodash';
import { Interception } from 'cypress/types/net-stubbing';

type Order = 'asc' | 'desc';

const shouldSort = (
  interception: Interception,
  property: string,
  order: Order
) => {
  const { request } = interception;

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

const payloadShouldContain = (
  interception: Interception,
  target: unknown,
  path?: string
) => {
  const {
    request: { body: payload },
  } = interception;

  const scope = path ? get(payload, path, {}) : payload;
  const serializedPayload = JSON.stringify(scope);
  const serializedTarget = JSON.stringify(target);

  expect(serializedPayload).to.include(serializedTarget);
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
Cypress.Commands.add(
  'payloadShouldContain',
  { prevSubject: true },
  payloadShouldContain
);

export interface InterceptionCommands {
  shouldSort: (property: string, order: Order) => void;
  shouldSortAscending: (property: string) => void;
  shouldSortDescending: (property: string) => void;
  payloadShouldContain: (target: unknown, targetPath?: string) => void;
}
