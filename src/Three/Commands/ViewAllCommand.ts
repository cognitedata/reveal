
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import ViewAllCommandIcon from "@images/Commands/ViewAllCommand.png";

export class ViewAllCommand extends ThreeRenderTargetCommand
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

  public /*override*/ get name(): string { return "View all" }
  public /*override*/ get icon(): string { return ViewAllCommandIcon; }

  protected /*override*/ invokeCore(): boolean
  {
    if (!this.target)
      return false;

    this.target.viewAll();
    return true;
  }
}


