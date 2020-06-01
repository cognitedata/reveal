
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";

export abstract class ToolCommand extends ThreeRenderTargetCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ get isCheckable(): boolean  { return true; } // Can be checked? (default false)

  protected /*override*/ invokeCore(): boolean {

    if (!this.target)
      return false;

    //this.target.activeTool = this;
    return true;
  }
}


