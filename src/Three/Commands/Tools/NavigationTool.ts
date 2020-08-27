import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseTool } from "@/Three/Commands/Tools/BaseTool";
import PanBaseToolIcon from "@images/Commands/NavigationTool.png";

export class NavigationTool extends BaseTool
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _movementX = -1;
  private _movementY = -1;

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null)
  {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  protected /*override*/ getTooltipCore(): string { return "Navigation\nLeft button: Rotate\nRight button: Pan \nWheel: Zoom\nLeft click: Pick to get information"; }

  public /*override*/ getName(): string { return "Navigation"; }
  public /*override*/ getIcon(): string { return PanBaseToolIcon; }

  //==================================================
  // OVERRIDES of BaseTool
  //==================================================

  public /*override*/ onActivate(): void
  {
    const { target } = this;
    if (!target)
      return;

    const { viewInfo } = target;
    viewInfo.clear();
    viewInfo.addActiveTool(this);
    viewInfo.addValue("Left button drag", "Rotate");
    viewInfo.addValue("Right button drag", "Move");
    viewInfo.addValue("Wheel", "Zoom in or out");
    viewInfo.addValue("Left click", "Pick any object in 3D to get information");
    target.invalidate();
  }

  public /*override*/ onMouseDown(event: MouseEvent): void
  {
    this._movementX = event.clientX;
    this._movementY = event.clientY;
  }

  public /*override*/ onMouseUp(event: MouseEvent): void
  {
    if (event.clientX === this._movementX && event.clientY === this._movementY)
      this.onShowInfo(event);
  }
}
