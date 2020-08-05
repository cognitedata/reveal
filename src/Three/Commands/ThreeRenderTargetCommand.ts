import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseCommand } from "@/Core/Commands/BaseCommand";

export abstract class ThreeRenderTargetCommand extends BaseCommand
{

  public target: null | ThreeRenderTargetNode = null; // Get the node to invoke the command on

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(target: ThreeRenderTargetNode | null = null)
  {
    super();
    this.target = target;
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ get isEnabled(): boolean { return this.target != null; }

  public /*override*/ get isChecked(): boolean { return false; }

  protected /*override*/ invokeValueCore(value: any): boolean { return false; }
}
