import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import ToggleBgColorCommandBlackIcon from "@images/Commands/ToggleBgColorCommandBlack.png";
import ToggleBgColorCommandWhiteIcon from "@images/Commands/ToggleBgColorCommandWhite.png";

export class ToggleBgColorCommand extends ThreeRenderTargetCommand
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

  public /*override*/ getName(): string { return "Toggle between black and white backgroud"; }

  public /*override*/ getIcon(): string { return this.isChecked ? ToggleBgColorCommandWhiteIcon : ToggleBgColorCommandBlackIcon; }

  public /*override*/ get isCheckable(): boolean { return true; } // Can be checked? (default false)

  public /*override*/ get isChecked(): boolean { return this.target ? this.target.isLightBackground : false; }

  protected /*override*/ invokeCore(): boolean
  {
    if (!this.target)
      return false;

    this.target.isLightBackground = !this.target.isLightBackground;
    this.target.invalidate();
    return true;
  }
}
