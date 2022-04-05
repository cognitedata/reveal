import '@testing-library/cypress/add-commands';
import { AdminCommands } from './admin.commands';
import { ButtonCommands } from './button.commands';
import { FavoriteCommands } from './favorite.commands';
import { FeedbackCommands } from './feedback.commands';
import { LoginCommand } from './login.command';
import { SearchCommands } from './search.commands';
import { SidebarCommands } from './sidebar.commands';
import { TableCommands } from './table.commands';
import { WellsCommands } from './wells.commands';

declare global {
  namespace Cypress {
    interface Chainable
      extends LoginCommand,
        SearchCommands,
        SidebarCommands,
        WellsCommands,
        FavoriteCommands,
        TableCommands,
        ButtonCommands,
        AdminCommands,
        FeedbackCommands {}
  }
}

export * from './login.command';
export * from './search.commands';
export * from './favorite.commands';
export * from './admin.commands';
export * from './wells.commands';
export * from './sidebar.commands';
export * from './table.commands';
export * from './button.commands';
export * from './feedback.commands';
