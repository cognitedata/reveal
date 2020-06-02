
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import MeasureDistanceToolIcon from "@images/Commands/MeasureDistanceTool.png";

export class MeasureDistanceTool extends ToolCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================
  public /*virtual*/ get icon(): string { return MeasureDistanceToolIcon; }
  public get name(): string { return "Measure distance" }
  public get tooltip(): string { return "Measure distance by click and drag to wantet position. You must hit a 3D object to see the distance." }
  public get shortcut(): string { return "S" }
}


