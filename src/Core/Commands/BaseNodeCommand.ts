import { BaseNode } from "@/Core/Nodes/BaseNode";
import { BaseCommand } from "@/Core/Commands//BaseCommand";

export abstract class BaseNodeCommand extends BaseCommand
{
  public node: null | BaseNode = null; // Get the node to invoke the command on

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(node: BaseNode | null = null)
  {
    super();
    this.node = node;
  }
}
