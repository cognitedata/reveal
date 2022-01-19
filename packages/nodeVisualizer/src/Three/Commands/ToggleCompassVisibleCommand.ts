import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import { CompassNode } from "@/Core/Nodes/Decorations/CompassNode";
import ToggleCompassVisibleCommandIcon from "@images/Commands/ToggleCompassVisibleCommand.png";

export class ToggleCompassVisibleCommand extends ThreeRenderTargetCommand {

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ getName(): string { return "Hide or show axis"; }

  public /* override */ getIcon(): string { return ToggleCompassVisibleCommandIcon; }

  public /* override */ get isCheckable(): boolean { return true; }

  public /* override */ get isChecked(): boolean { return this.target ? this.target.hasViewOfNodeType(CompassNode) : false; }

  protected /* override */ invokeCore(): boolean {
    if (!this.target)
      return false;

    for (const node of this.target.root.getDescendantsByType(CompassNode))
      node.toggleVisibleInteractive(this.target);
    return true;
  }
}
