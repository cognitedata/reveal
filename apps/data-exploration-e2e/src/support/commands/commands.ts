import '@testing-library/cypress/add-commands';

import { AppCommands } from './app.commands';
import { ButtonCommands } from './button.commands';
import { CommonCommands } from './common.commands';
import { DatePickerCommands } from './date-picker.commands';
import { FilterCommands } from './filter.commands';
import { InterceptionCommands } from './interception.commands';
import { SearchConfigCommands } from './search-config.commands';
import { SearchCommand } from './search.commands';
import { TableCommands } from './table.commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Chainable
      extends AppCommands,
        ButtonCommands,
        CommonCommands,
        DatePickerCommands,
        FilterCommands,
        InterceptionCommands,
        SearchCommand,
        SearchConfigCommands,
        TableCommands {}
  }
}

export * from './app.commands';
export * from './button.commands';
export * from './common.commands';
export * from './date-picker.commands';
export * from './filter.commands';
export * from './interception.commands';
export * from './search-config.commands';
export * from './search.commands';
export * from './table.commands';
