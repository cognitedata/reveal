
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import MeasureDistanceToolIcon from "@images/Commands/MeasureDistanceTool.png";

export class MeasureDistanceTool extends ToolCommand
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

  public /*override*/ getName(): string { return "Measure distance" }
  public /*override*/ getIcon(): string { return MeasureDistanceToolIcon; }
  public /*override*/ get tooltip(): string { return "Measure distance by click and drag to wantet position. You must hit a 3D object to see the distance." }
  public /*override*/ get shortcut(): string { return "S" }
}


