import { BaseCommand } from '../../Core/Commands/BaseCommand';
import { ThreeRenderTargetNode } from '../Nodes/ThreeRenderTargetNode';

export abstract class ThreeRenderTargetCommand extends BaseCommand {
  public target: null | ThreeRenderTargetNode = null; // Get the node to invoke the command on

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  protected constructor(target: ThreeRenderTargetNode | null = null) {
    super();
    this.target = target;
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ isEnabled(): boolean {
    return this.target != null;
  }

  public get /* override */ isChecked(): boolean {
    return false;
  }
}
