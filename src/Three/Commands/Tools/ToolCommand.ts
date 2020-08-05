import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";

export abstract class ToolCommand extends ThreeRenderTargetCommand
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

  public /*override*/ get isCheckable(): boolean { return true; }

  public /*override*/ get isChecked(): boolean
  {
    if (!this.target)
      return false;

    return this.target.activeTool === this;
  }

  protected /*override*/ invokeCore(): boolean
  {
    if (!this.target)
      return false;

    this.target.activeTool = this;
    return true;
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ overrideLeftButton(): boolean { return false; }

  public /*virtual*/ onMouseClick(event: MouseEvent): void { }

  public /*virtual*/ onMouseDown(event: MouseEvent): void { }

  public /*virtual*/ onMouseUp(event: MouseEvent): void { }

  public /*virtual*/ onMouseHover(event: MouseEvent): void { }

  public /*virtual*/ onMouseDrag(event: MouseEvent): void { }

  public /*virtual*/ onMouseMove(event: MouseEvent): void { }
}
