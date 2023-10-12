import { CommonCommands } from './common.commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Chainable extends CommonCommands {}
  }
}

export * from './common.commands';
