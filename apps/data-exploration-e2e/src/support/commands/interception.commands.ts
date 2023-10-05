import { Interception } from 'cypress/types/net-stubbing';
import { get } from 'lodash';

type Order = 'asc' | 'desc';

const shouldSort = (interception: Interception, key: string, order: Order) => {
  const { request } = interception;

  expect(request.body.sort[0]).to.deep.include({
    property: key.split('.'),
    order,
  });
};

const shouldSortAscending = (interception: Interception, key: string) => {
  cy.wrap(interception).shouldSort(key, 'asc');
};

const shouldSortDescending = (interception: Interception, key: string) => {
  cy.wrap(interception).shouldSort(key, 'desc');
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
  shouldSort: (key: string, order: Order) => void;
  shouldSortAscending: (key: string) => void;
  shouldSortDescending: (key: string) => void;
  payloadShouldContain: (target: unknown, targetPath?: string) => void;
}
