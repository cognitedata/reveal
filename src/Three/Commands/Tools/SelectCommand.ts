
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

  public /*override*/ get name(): string { return "Select or pick" }
  public /*override*/ get icon(): string { return SelectCommandIcon; }


  //==================================================
  // OVERRIDES of ToolCommand
  //==================================================

  public /*override*/ hasMouseClick(): boolean { return true; }

  public /*override*/ onMouseClick(event: MouseEvent): void
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


