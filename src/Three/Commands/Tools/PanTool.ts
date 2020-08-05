import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import PanToolCommandIcon from "@images/Commands/PanToolCommand.png";

export class PanTool extends BaseTool
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

  public /*override*/ getName(): string { return "Pan/Rotate/Zoom"; }
  public /*override*/ getIcon(): string { return PanToolCommandIcon; }
}
