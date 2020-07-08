
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import { AxisNode } from "@/Core/Nodes/Decorations/AxisNode";
import CopyImageIcon from "@images/Commands/CopyImage.png";

export class CopyImageCommand extends ThreeRenderTargetCommand
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

  public /*override*/ getName(): string { return "Copy a image of the viewer to the clipboard" }
  public /*override*/ getIcon(): string { return CopyImageIcon; }
  protected /*override*/  invokeCore(): boolean
  {

    if (!this.target)
      return false;

    // var domElement = this.target.domElement;
    //const base64ImageData = domElement.toDataURL();
    return false;
  }
}


