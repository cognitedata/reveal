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

  public /*override*/ getName(): string { return "Zoom to target"; }

  public /*override*/ getIcon(): string { return ZoomToTargetToolCommandIcon; }

  public /*override*/ getShortCutKeys(): string { return "S"; }

  //==================================================
  // OVERRIDES of ToolCommand
  //==================================================

  public /*override*/ overrideLeftButton(): boolean { return true; }

  public /*override*/ onMouseClick(event: MouseEvent): void
  {
    const {target} = this;
    if (!target)
      return;

    const pixelCoords = target.getMouseRelativePosition(event);
    const worldCoords = target.getClickPosition(pixelCoords);
    if (!worldCoords)
      return;

    const {cameraControl} = target;
    cameraControl.zoomToTarget(worldCoords);
    target.setDefaultTool();
  }
}
