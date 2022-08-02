import '@testing-library/cypress/add-commands';
import { AdminCommands } from './admin.commands';
import { ButtonCommands } from './button.commands';
import { CommentCommands } from './comments.commands';
import { DocumentCommands } from './document.commands';
import { FavoriteCommands } from './favorite.commands';
import { FeedbackCommands } from './feedback.commands';
import { LoginCommand } from './login.command';
import { MapCommands } from './map.commands';
import { SavedSearchCommands } from './savedSearches.commands';
import { SearchCommands } from './search.commands';
import { SettingsCommands } from './settings.commands';
import { SidebarCommands } from './sidebar.commands';
import { TableCommands } from './table.commands';
import { WellsCommands } from './wells.commands';

declare global {
  namespace Cypress {
    interface Chainable
      extends AdminCommands,
        CommentCommands,
        ButtonCommands,
        DocumentCommands,
        FavoriteCommands,
        FeedbackCommands,
        MapCommands,
        SavedSearchCommands,
        SearchCommands,
        SettingsCommands,
        SidebarCommands,
        TableCommands,
        WellsCommands,
        LoginCommand {}
  }
}

export * from './login.command';
export * from './comments.commands';
export * from './search.commands';
export * from './favorite.commands';
export * from './admin.commands';
export * from './wells.commands';
export * from './sidebar.commands';
export * from './table.commands';
export * from './button.commands';
export * from './map.commands';
export * from './feedback.commands';
export * from './savedSearches.commands';
export * from './settings.commands';
export * from './document.commands';
