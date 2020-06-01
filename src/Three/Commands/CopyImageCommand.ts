
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import { AxisNode } from "@/Nodes/Decorations/AxisNode";
import CopyImageIcon from "@images/Commands/CopyImage.png";

export class CopyImageCommand extends ThreeRenderTargetCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*virtual*/ get icon(): string { return CopyImageIcon; }

  public /*override*/get name(): string { return "Copy a image of the viewer to the clipboard" }

  protected invokeCore(): boolean {
    return true;
  }
}


