
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import { AxisNode } from "@/Nodes/Decorations/AxisNode";
import ToggleAxisVisibleCommandIcon from "@images/Commands/ToggleAxisVisibleCommand.png";

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

  public /*override*/get name(): string { return "Hide or show axis" }

  public /*override*/ get isCheckable() { return true; } // Can be checked? (default false)

  public /*override*/ get isChecked(): boolean { return this.target ? this.target.hasViewOfNodeType(AxisNode) : false; }

  public /*virtual*/ get icon(): string { return ToggleAxisVisibleCommandIcon; }

  protected invokeCore(): boolean {
    if (!this.target)
      return false;

    for (const node of this.target.root.getDescendantsByType(AxisNode))
      node.toggleVisibleInteractive(this.target);
    return true;
  }
}


