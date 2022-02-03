import '@testing-library/cypress/add-commands';
import { AdminCommands } from './admin.commands';
import { FavoriteCommands } from './favorite.commands';
import { LoginCommand } from './login.command';
import { SearchCommands } from './search.commands';
import { SidebarCommands } from './sidebar.commands';
import { WellsCommands } from './wells.commands';

declare global {
  namespace Cypress {
    interface Chainable
      extends LoginCommand,
        SearchCommands,
        SidebarCommands,
        WellsCommands,
        FavoriteCommands,
        AdminCommands {}
  }
}

export * from './login.command';
export * from './search.commands';
export * from './favorite.commands';
export * from './admin.commands';
export * from './wells.commands';
export * from './sidebar.commands';
