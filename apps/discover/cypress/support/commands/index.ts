import '@testing-library/cypress/add-commands';

import { DocumentsCommands } from './documents.commands';
import { LoginCommand } from './login.command';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable extends LoginCommand, DocumentsCommands {
      dataCy(value: string): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

export * from './login.command';
export * from './documents.commands';
