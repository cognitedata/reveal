
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";
import ZoomToTargetToolCommandIcon from "@images/Commands/ZoomToTargetToolCommand.png";

export class ZoomToTargetToolCommand extends ToolCommand
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

  public /*override*/ get name(): string { return "Zoom to target" }
  public /*override*/ get icon(): string { return ZoomToTargetToolCommandIcon; }
  public /*override*/ get shortcut(): string { return "S" }

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
    const world = target.getClickPosition(pixel);
    if (world == null)
      return;

    const cameraControl = target.cameraControl;
    cameraControl.zoomToTarget(world);
    target.setDefaultTool();
  }
}


