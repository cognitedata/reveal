
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

    return this.target.activeTool != null;
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

  public hasMouseClick(): boolean { return false; }
  public onMouseClick(event: MouseEvent): void { }

  public onMouseMove(event: MouseEvent): void
  {
    const target = this.target;
    if (!target)
      return;

    const pixel = target.getMouseRelativePosition(event);
    const intersection = target.getIntersection(pixel);
    if (!intersection)
      return;

    const node = target.getNodeByObject(intersection.object);
    if (!node)
      return;
  }
}


