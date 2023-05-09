import { LoginCommand } from './login.commands';
import { SearchCommand } from './search.commands';
import { ButtonCommands } from './button.commands';
import '@testing-library/cypress/add-commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Chainable extends LoginCommand, SearchCommand, ButtonCommands {
      login(email: string, password: string): void;
    }
  }
}

export * from './login.commands';
export * from './search.commands';
export * from './button.commands';
