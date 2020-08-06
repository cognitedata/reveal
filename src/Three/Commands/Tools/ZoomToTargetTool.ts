import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import ZoomToTargetToolCommandIcon from "@images/Commands/ZoomToTargetToolCommand.png";

export class ZoomToTargetTool extends BaseTool
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
    const { target } = this;
    if (!target)
      return;

    const worldCoords = target.getClickPosition(event);
    if (!worldCoords)
      return;

    const { cameraControl } = target;
    cameraControl.zoomToTarget(worldCoords);
    target.setDefaultTool();
  }
}
