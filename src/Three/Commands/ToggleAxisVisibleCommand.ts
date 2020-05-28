
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import { AxisNode } from "@/Nodes/Decorations/AxisNode";

export class ToggleAxisVisibleCommand extends ThreeRenderTargetCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*virtual*/get name(): string { return "Hide or show axis" }

  public /*virtual*/ get isCheckable() { return true; } // Can be checked? (default false)

  public /*virtual*/ get isChecked(): boolean { return this.target ? this.target.hasViewOfNodeType(AxisNode) : false; }

  protected invokeCore(): boolean {
    if (!this.target)
      return false;

    for (const node of this.target.root.getDescendantsByType(AxisNode))
        node.toggleVisibleInteractive(this.target);
    return true;
  }
}


