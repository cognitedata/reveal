import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import ToggleCameraTypeCommandOrthographicIcon from "@images/Commands/ToggleCameraTypeCommandOrthographic.png";
import ToggleCameraTypeCommandPerspectiveIcon from "@images/Commands/ToggleCameraTypeCommandPerspective.png";

export class ToggleCameraTypeCommand extends ThreeRenderTargetCommand
{
  // Whether setlected camera is Perspective mode or Orthographic mode
  private isPerspectiveMode = true;

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

  public /*override*/ getName(): string { return "Toggle between orthographic and perspective view"; }

  public /*override*/ getIcon(): string { return this.isChecked ? ToggleCameraTypeCommandOrthographicIcon : ToggleCameraTypeCommandPerspectiveIcon; }

  public /*override*/ get isCheckable(): boolean { return true; } // Can be checked? (default false)

  public /*override*/ get isChecked(): boolean { return this.isPerspectiveMode; }

  protected /*override*/ invokeCore(): boolean
  {
    if(!this.target)
      return false;

    const objectCountExceptAxis = this.target.viewsShownHere.list.length - 1;
      
    // Disable the button when objects are not exists on view
    if (objectCountExceptAxis < 1)
      return false;

    this.isPerspectiveMode = !this.isPerspectiveMode;
    this.target.switchCamera(this.isPerspectiveMode);
    return true;
  }
}
