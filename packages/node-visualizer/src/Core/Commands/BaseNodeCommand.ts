import { BaseNode } from '../Nodes/BaseNode';

import { BaseCommand } from './BaseCommand';

export abstract class BaseNodeCommand extends BaseCommand {
  public node: null | BaseNode = null; // Get the node to invoke the command on

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(node: BaseNode | null = null) {
    super();
    this.node = node;
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ isEnabled(): boolean {
    return this.node != null;
  }
}
