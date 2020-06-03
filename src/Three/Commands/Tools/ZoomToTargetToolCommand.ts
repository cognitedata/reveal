
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import ZoomToTargetToolCommandIcon from "@images/Commands/ZoomToTargetToolCommand.png";

export class ZoomToTargetToolCommand extends ToolCommand
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

  public /*override*/ get name(): string { return "Zoom to target" }
  public /*override*/ get icon(): string { return ZoomToTargetToolCommandIcon; }
  public /*override*/ get shortcut(): string { return "S" }
}


