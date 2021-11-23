import '@testing-library/cypress/add-commands';

import { DocumentsCommands } from './documents.commands';
import { FavoriteCommands } from './favorite.commands';
import { LoginCommand } from './login.command';

declare global {
  namespace Cypress {
    interface Chainable
      extends LoginCommand,
        DocumentsCommands,
        FavoriteCommands {}
  }
}

export * from './login.command';
export * from './documents.commands';
export * from './favorite.commands';
