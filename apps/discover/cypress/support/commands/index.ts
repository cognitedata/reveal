import '@testing-library/cypress/add-commands';

import { DocumentsCommands } from './documents.commands';
import { LoginCommand } from './login.command';

declare global {
  namespace Cypress {
    interface Chainable extends LoginCommand, DocumentsCommands {}
  }
}

export * from './login.command';
export * from './documents.commands';
