
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import PanToolCommandIcon from "@images/Commands/PanToolCommand.png";

export class PanToolCommand extends ToolCommand
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

  public /*override*/ getName(): string { return "Pan/Rotate/Zoom" }
  public /*override*/ getIcon(): string { return PanToolCommandIcon; }

  //==================================================
  // OVERRIDES of ToolCommand
  //==================================================

  public /*override*/ onMouseClick(event: MouseEvent): void
  {
    const target = this.target;
    if (!target)
      return;

    const pixel = target.getMouseRelativePosition(event);
    const intersection = target.getIntersection(pixel);
    if (!intersection)
      return;

    const view = target.getViewByObject(intersection.object);
    if (!view)
      return;

    view.onMouseClick(intersection)
  }
}


