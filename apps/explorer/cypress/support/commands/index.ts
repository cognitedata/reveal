import '@testing-library/cypress/add-commands';

import { LoginCommand } from './login.command';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Chainable extends LoginCommand {}
  }
}

export * from './login.command';
