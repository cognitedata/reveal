
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import { AxisNode } from "@/Nodes/Decorations/AxisNode";

export class ToggleCameraTypeCommand extends ThreeRenderTargetCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/get name(): string { return "Toggle between orthographic and perspective view" }

  public /*override*/ get isCheckable() { return true; } // Can be checked? (default false)

  public /*override*/ get isChecked(): boolean { return this.target ? this.target.hasViewOfNodeType(AxisNode) : false; }

  protected invokeCore(): boolean {
    if (!this.target)
      return false;

    return true;
  }
}


