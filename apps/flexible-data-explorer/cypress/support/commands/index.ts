import '@testing-library/cypress/add-commands';

import { AppCommands } from './app.commands';
import { ButtonCommands } from './button.commands';
import { CommonCommands } from './common.commands';
import { DataModelSelectorCommands } from './data-model-selector.commands';
import { InterceptionCommands } from './interception.commands';
import { SearchCommands } from './search.commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Chainable
      extends AppCommands,
        ButtonCommands,
        CommonCommands,
        DataModelSelectorCommands,
        InterceptionCommands,
        SearchCommands {}
  }
}

export * from './app.commands';
export * from './button.commands';
export * from './common.commands';
export * from './data-model-selector.commands';
export * from './interception.commands';
export * from './search.commands';
