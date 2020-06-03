
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import ZoomToolCommandIcon from "@images/Commands/ZoomToolCommand.png";

export class ZoomToolCommand extends ToolCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public get name(): string { return "Rectangle zoom" }

  public /*virtual*/ get icon(): string { return ZoomToolCommandIcon; }

}


