import '@testing-library/cypress/add-commands';

import { ButtonCommands } from './button.commands';
import { CommonCommands } from './common.commands';
import { DatePickerCommands } from './date-picker.commands';
import { FilterCommands } from './filter.commands';
import { InterceptionCommands } from './interception.commands';
import { LoginCommand } from './login.commands';
import { SearchCommand } from './search.commands';
import { TableCommands } from './table.commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Chainable
      extends ButtonCommands,
        DatePickerCommands,
        FilterCommands,
        InterceptionCommands,
        LoginCommand,
        SearchCommand,
        TableCommands,
        CommonCommands {
      login(email: string, password: string): void;
    }
  }
}

export * from './button.commands';
export * from './common.commands';
export * from './date-picker.commands';
export * from './filter.commands';
export * from './interception.commands';
export * from './login.commands';
export * from './search.commands';
export * from './table.commands';
