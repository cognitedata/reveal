import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
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

  protected /*override*/ invokeCore(): boolean 
  {
    this.target?.domElement.toBlob((blob: any) => {
      // @ts-ignore
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob})]);
    });
    return true;
  }
}


