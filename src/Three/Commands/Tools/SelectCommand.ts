
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import SelectCommandIcon from "@images/Commands/SelectCommand.png"

export class SelectCommand extends ToolCommand
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

  public /*override*/ getName(): string { return "Select or pick" }
  public /*override*/ getIcon(): string { return SelectCommandIcon; }

  //==================================================
  // OVERRIDES of ToolCommand
  //==================================================

  public /*override*/ overrideLeftButton(): boolean { return true; }

  public /*override*/ onMouseHover(event: MouseEvent): void
  {
    const target = this.target;
    if (!target)
      return;

    const viewInfo = target.viewInfo;
    const preCount = viewInfo.items.length;
    viewInfo.clearItems();

    const pixel = target.getMouseRelativePosition(event);
    const intersection = target.getIntersection(pixel);
    if (intersection)
    {
      const view = target.getViewByObject(intersection.object);
      if (view)
        view.onShowInfo(viewInfo, intersection);
    }
    const postCount = viewInfo.items.length;
    if (preCount > 0 || postCount > 0)
      target.invalidate();
  }
}


