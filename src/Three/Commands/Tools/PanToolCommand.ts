
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import PanToolCommandIcon from "@images/Commands/PanToolCommand.png";

export class PanToolCommand extends ToolCommand
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

  public /*override*/ get name(): string { return "Pan/Rotate/Zoom" }
  public /*override*/ get icon(): string { return PanToolCommandIcon; }
}


