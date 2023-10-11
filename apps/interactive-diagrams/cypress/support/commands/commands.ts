import { CommonCommands } from './common.commands';
import { CreateFlowCommands } from './createFlow.commands';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable extends CommonCommands, CreateFlowCommands {}
  }
}

export * from './common.commands';
export * from './createFlow.commands';
