
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";

export abstract class ToolCommand extends ThreeRenderTargetCommand
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ get isCheckable(): boolean { return true; }

  public /*override*/ get isChecked(): boolean
  {
    if (!this.target)
      return false;

    return this.target.getActiveTool() != null;
  }

  protected /*override*/ invokeCore(): boolean
  {
    if (!this.target)
      return false;

      this.target.setActiveTool(this);
      return true;
  }
}


