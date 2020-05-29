
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


  public /*virtual*/ get isCheckable() { return true; } // Can be checked? (default false)

  protected /*virtual*/ invokeCore(): boolean {

    if (!this.target)
      return false;

    //this.target.activeTool = this;
    return true;
  }
}


