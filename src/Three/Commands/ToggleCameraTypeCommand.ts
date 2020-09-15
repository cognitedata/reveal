import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import ToggleCameraTypeCommandOrthographicIcon from "@images/Commands/ToggleCameraTypeCommandOrthographic.png";
import ToggleCameraTypeCommandPerspectiveIcon from "@images/Commands/ToggleCameraTypeCommandPerspective.png";

export class ToggleCameraTypeCommand extends ThreeRenderTargetCommand
{
  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public /*override*/ getName(): string { return "Toggle between orthographic and perspective view"; }
  public /*override*/ getIcon(): string { return this.isChecked ? ToggleCameraTypeCommandOrthographicIcon : ToggleCameraTypeCommandPerspectiveIcon; }
  public /*override*/ get isCheckable(): boolean { return true; }
  public /*override*/ get isChecked(): boolean { return this.target?.isPerspectiveMode || false; }

  public /*override*/ get isVisible(): boolean 
  { 
    if (!this.target)
      return false;
    return !this.target.is2D; 
  }

  protected /*override*/ invokeCore(): boolean
  {
    if (!this.target)
      return false;

    if (this.target.is2D)
      return false;

    this.target.isPerspectiveMode = !this.target.isPerspectiveMode;
    return true;
  }
}
