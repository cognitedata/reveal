import { CommonCommands } from './common.commands';
import { HomePageCommands } from './homePage.commands';
import { QuickMatchCommands } from './quickMatch.commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable
      extends CommonCommands,
        HomePageCommands,
        QuickMatchCommands {}
  }
}

export * from './common.commands';
export * from './homePage.commands';
export * from './quickMatch.commands';
