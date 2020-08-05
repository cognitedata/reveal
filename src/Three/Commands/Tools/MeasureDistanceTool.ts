import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import MeasureDistanceToolIcon from "@images/Commands/MeasureDistanceTool.png";

export class MeasureDistanceTool extends BaseTool
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

  public /*override*/ getName(): string { return "Measure distance"; }
  public /*override*/ getIcon(): string { return MeasureDistanceToolIcon; }
  public /*override*/ getTooltip(): string { return "Measure distance by click and drag to wantet position. You must hit a 3D object to see the distance."; }
  public /*override*/ getShortCutKeys(): string { return "M"; }
}
