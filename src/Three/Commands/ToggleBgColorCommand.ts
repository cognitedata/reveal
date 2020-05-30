
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";

export class ToggleBgColorCommand extends ThreeRenderTargetCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public/*override*/ get name(): string { return "Toggle between black and white backgroud" }

  public /*override*/ get isCheckable() { return true; } // Can be checked? (default false)

  public /*override*/ get isChecked(): boolean { return this.target ? this.target.isLightBackground : false; }

  protected /*override*/ invokeCore(): boolean {
    if (!this.target)
      return false;

    this.target.isLightBackground = !this.target.isLightBackground;
    this.target.invalidate();
    return true;
  }
}


