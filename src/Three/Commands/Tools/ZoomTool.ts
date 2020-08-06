import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import ZoomBaseToolIcon from "@images/Commands/ZoomTool.png";

export class ZoomTool extends BaseTool
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

  public /*override*/ getName(): string { return "Rectangle zoom"; }
  public /*override*/ getIcon(): string { return ZoomBaseToolIcon; }
}
